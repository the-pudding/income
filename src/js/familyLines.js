import loadData from './load-data'
import enterView from 'enter-view';

const $section = d3.select('.familyLines');
const $family__container = $section.select('.family__figure');
const $canvas__container = $family__container.select('.canvasContainer');
const $familyHist__svg = $family__container.select('svg.familyBars_svg');

const $skipToEnd__btn = $section.select('.skipToEnd');

// dimensions
const margin = {top: 20, bottom: 40, left: 140, right: 0};
const margin_hist = {left: 10, right: 20};
let familyLines_width = $canvas__container.node().getBoundingClientRect().width - margin.left - margin.right;
let familyHist_width = $familyHist__svg.node().getBoundingClientRect().width - margin_hist.left - margin_hist.right;
let height = $family__container.node().offsetHeight - margin.top - margin.bottom;

// add in canvas element
const $canvas = $canvas__container.append('canvas')
	.attr('width', familyLines_width + margin.left + margin.right)
	.attr('height', height);

let $context = $canvas.node().getContext('2d');

// parameters for line chart animation
let timer;
const maxLines = 10;  // max number of lines that should appear on the chart at any given time
let ms_slow = 750;  // how much time should elapse before the next line is drawn during the slow phase of the animation
let ms_fast = 20; // how much time should elapse during the sped up phase of the animation
// animation will take: (10 * 750) + ((7857-10) * 20) = 164,440 ms or 2.74 min to run

const quintileNames = ["Lower", "Lower Middle", "Middle", "Upper Middle", "Upper"];
// scales
const scaleX_line = d3.scaleLinear()
	// .domain([0, 40])
	.range([margin.left, margin.left + familyLines_width]);

const scaleY_line = d3.scaleLinear()
	.domain([0, 100])
	.range([height, 0]);

const scaleX_hist = d3.scaleLinear()
	.domain([0, 150])
	.range([0, familyHist_width]);

let scaleX_hist_breakpoints = [500, 1000, 5000, 10000, 20000, 30000, 43000];

const scaleY_hist = d3.scaleBand()
	.domain(quintileNames)
	.range([height, 0]);

const colorScale = d3.scaleOrdinal()
	.domain(quintileNames)
	.range(["#f9cdce", "#fbdddd", "#fcf5db", "#e1f5ea", "#d4f1df"]);

const line = d3.line()
    // .defined(function(d) { return !isNaN(d.enrollment) && d.enrollment >= 0; })
    .x(d => scaleX_line(d.year))
    .y(d => scaleY_line(d.pctile))
    .curve(d3.curveStepAfter)
    .context($context);

// console.log($guess__container.node().offsetWidth, $guess__container.node().offsetHeight)

// initial data for the histogram
let histData = [{quintile: 'Lower', n: 0},
	{quintile: 'Lower Middle', n: 0},
	{quintile: 'Middle', n: 0},
	{quintile: 'Upper Middle', n: 0},
	{quintile: 'Upper', n: 0}];


// let $lines = $familyLines__vis.append('g');

// set up histogram
let $familyHist__vis = $familyHist__svg.attr('width', familyHist_width + margin_hist.left + margin_hist.right)
	.attr('height', height + margin.top + margin.bottom)
	.append('g')
	.attr('transform', 'translate(' + margin_hist.left + ',' + margin.top + ')');

let $bars = $familyHist__vis.selectAll('.bar')
	.data(histData)
	.enter()
	.append('rect')
	.attr('class', 'bar')
	.attr('x', 0)
	.attr('y', d => scaleY_hist(d.quintile))
	.attr('width', d => scaleX_hist(d.n))
	.attr('height', scaleY_hist.bandwidth())
	.style('fill', d => colorScale(d.quintile));

loadData('line_chart_data.csv').then(result => {
	// console.log(result);
	// nest data because that's the structure d3 needs to make line charts
	let dataByFamily = d3.nest()
		.key(d => d.id)
		.entries(result);

	const totalLines = dataByFamily.length;

	// set scale domains
	scaleX_line.domain([0, d3.max(result, d => +d.year)]).nice();
	const counts = countFrequency(result);
	let countsArray = objToArray(counts);

	// scaleX_hist.domain([0, d3.max(countsArray, d => d.n)]);
	// console.log(scaleX_hist.domain());
	// console.log(dataByFamily[0]);

	// append axis for debugging purposes
	// $familyLines__vis.append('g')
	// 	.attr('class', 'axis axis--y')
	// 	.call(d3.axisLeft(scaleY_line));

	// $familyLines__vis.append('g')
	// 	.attr('class', 'axis axis--x')
	// 	.attr('transform', 'translate(0,' + height + ')')
	// 	.call(d3.axisBottom(scaleX_line));

	addQuintileBackground();

	$familyHist__vis.append('g')
		.attr('class', 'axis axis--x')
		.attr('transform', 'translate(0,' + height + ')')
		.call(d3.axisBottom(scaleX_hist).ticks(4));

	// // try drawing the lines using canvas
	// dataByFamily.forEach(d => {
	// 	$context.beginPath();
	// 	line(d.values);
	// 	$context.stroke();
	// })

	enterView({
		selector: '.family__figure',
		offset: 0.5,
		enter: function(el) {
			// el.classList.add('entered');
			// console.log("I'm on the screen!");
			// animateCharts(dataByFamily);
			let fam_num = 0;

			timer = setTimeout(animateLines, ms_slow);

			function animateLines() {
				if(fam_num < totalLines) {
				// if(fam_num < 100) {
					if(fam_num < maxLines) {
						animate1(dataByFamily, fam_num);
						timer = setTimeout(animateLines, ms_slow);
					}
					else {
						animate2(dataByFamily, fam_num);
						timer = setTimeout(animateLines, ms_fast);
					}
				}
				fam_num++;
			}
		},
		once: true,
	});

	// event handlers
	$skipToEnd__btn.on('click', () => showEnd(countsArray));

}).catch(console.error);

function showEnd(countsArray) {
	// when user clicks the button to skip the animation, cancel the timer, remove all lines
	// from the plot and show the histogram with data from all families
	clearTimeout(timer);

	$lines.selectAll(".line").remove();

	scaleX_hist.domain([0, scaleX_hist_breakpoints[scaleX_hist_breakpoints.length - 1]]);

	$familyHist__vis.selectAll(".axis.axis--x")
		.transition()
		.call(d3.axisBottom(scaleX_hist).ticks(4));

	$bars.data(countsArray)
		.transition()
		.duration(500)
		.attr('width', d => scaleX_hist(d.n));
}

function animate1(data, fam_num) {
	// animation function for the first few lines where multiple lines appear on the plot at once
	// when the next line is drawn, reduce the opacity of previously drawn line and remove the
	// line entirely when ten more lines are drawn afterwards
	$context.clearRect(0, 0, $canvas.attr('width'), $canvas.attr('height'));

	addQuintileBackground();

	$context.beginPath();
	line(data[fam_num].values);
	$context.stroke();

	// add fade out to previous 9 lines (fam_num - 9) here

	updateHistogram(data, fam_num, ms_slow);
}

function animate2(data, fam_num) {
	// animation function for the remaining lines when the animation is sped up
	// because the animation is so fast, only one line appears on the plot at once so
	// there's no need to fade it out - instead, just remove the line before drawing the next one

	$context.clearRect(0, 0, $canvas.attr('width'), $canvas.attr('height'));

	addQuintileBackground();

	$context.beginPath();
	line(data[fam_num].values);
	$context.stroke();

	updateHistogram(data, fam_num, ms_fast);
}

function updateHistogram(data, fam_num, time) {
	// update histogram
	updateHistData(data[fam_num].values);

	// check if we need to update histogram's scaleX
	updateHistScaleX();

	$bars.data(histData)
		.transition()
		.duration(time)
		.attr('width', d => scaleX_hist(d.n));
}
// function animateCharts(data) {
// 	// draw first line
// 	$lines.selectAll('.line.family_0')
// 		.data(data.filter((d, i) => i == 0))
// 		.enter()
// 		.append('path')
// 		.attr('class', (d, i) => 'line family_' + i)
// 		.attr('d', d => line(d.values))
// 		.style('opacity', 1)
// 		.transition()
// 		.delay(ms_slow)  // once next line is drawn, reduce the opacity of this line
// 		.style('opacity', 0.05)
// 		.transition()
// 		.delay(ms_slow * maxLines)
// 		.duration(ms_slow)
// 		.style('opacity', 0)
// 		.remove();

// 	let fam_num = 1;

// 	// update histogram with first family's data
// 	updateHistData(data[0].values);
// 	$bars.data(histData)
// 		.transition()
// 		.duration(ms_slow)
// 		.attr('width', d => scaleX_hist(d.n));


// 	// animate chart
// 	let t = d3.interval(function(elapsed) {
// 		// transition lines
// 		$lines.selectAll('.line.family_' + fam_num)
// 			.data(data.filter((d, i) => i == fam_num))
// 			.enter()
// 			.append('path')
// 			.attr('class', (d, i) => 'line family_' + fam_num)
// 			.attr('d', d => line(d.values))
// 			.style('opacity', 1)
// 			.transition()
// 			.delay(ms_slow)
// 			.style('opacity', 0.05)
// 			.transition()
// 			.delay(ms_slow * maxLines)  // it takes 5 seconds (0.25 * 20) to add 20 new lines to the chart
// 			.duration(ms_slow)
// 			.style('opacity', 0)
// 			.remove();

// 		// update histogram
// 		updateHistData(data[fam_num].values);

// 		// check if we need to update histogram's scaleX
// 		updateHistScaleX();

// 		$bars.data(histData)
// 			.transition()
// 			.duration(ms_slow)
// 			.attr('width', d => scaleX_hist(d.n));

// 		fam_num++;

// 		if (fam_num === 100) t.stop();
// 	}, ms_slow);
// }

function addQuintileBackground() {
	// shades the part of the plot that corresponds to each quintile with that quintile's color
	// also labels each colored area with the quintile name to the left of the plot

	quintileNames.forEach((d, i) => {
		$context.fillStyle = colorScale(d);
		$context.fillRect(margin.left, scaleY_line((i + 1) * 20), familyLines_width, height / 5)

		$context.font = '18px Tiempos Text Web'
		$context.fillStyle = '#000';
		$context.textAlign = 'end';
		$context.textBaseline = 'middle';
		$context.fillText(d, margin.left - 10, scaleY_line(i * 20) - (height / 10));
	});
}

function updateHistScaleX() {
	// updates the ScaleX for the histogram when the number of observations exceeds the current domain bounds
	const dataMax = d3.max(histData, d => d.n);
	const scale_current_max = scaleX_hist.domain()[1];

	if(dataMax > scale_current_max) {
		scaleX_hist.domain([0, scaleX_hist_breakpoints[0]]);
		scaleX_hist_breakpoints.shift();  // TODO: need to store these in a new array in case user hits the replay button (or make a copy of the original array and .shift on the copy)

		$familyHist__vis.selectAll(".axis.axis--x")
			.transition()
			.call(d3.axisBottom(scaleX_hist).ticks(4));
	}
}

function updateHistData(data) {
	// updates the data used for the histogram (histData) with the frequencies from one additional family
	let countsObj = countFrequency(data);
	histData.forEach(d => {
		if(d.quintile === 'Lower') d.n += countsObj['Lower'];
		else if(d.quintile == 'Lower Middle') d.n += countsObj['Lower Middle'];
		else if(d.quintile == 'Middle') d.n += countsObj['Middle'];
		else if(d.quintile == 'Upper Middle') d.n += countsObj['Upper Middle'];
		else if(d.quintile == 'Upper') d.n += countsObj['Upper'];
	});
}

function countFrequency(data) {
	// returns an object with the total number of occurrences of a quintile in the data

	// set up an object to hold the counts
	let quintileCountsObj = {};
	quintileNames.forEach(d => quintileCountsObj[d] = 0);

	// populate the object with frequencies
	data.forEach(d => {
		if(d.quintile === '1') quintileCountsObj['Lower']++;
		else if(d.quintile === '2') quintileCountsObj['Lower Middle']++;
		else if(d.quintile === '3') quintileCountsObj['Middle']++;
		else if(d.quintile === '4') quintileCountsObj['Upper Middle']++;
		else if(d.quintile === '5') quintileCountsObj['Upper']++;
	})

	return quintileCountsObj;
}

function objToArray(obj) {
	// turns the object with quintile frequency counts into an array that d3 prefers
	var quintileArray = [];
	quintileArray = Object.keys(obj).map(key => {
		return {quintile: key, n: obj[key]};
	});

	return quintileArray;
}