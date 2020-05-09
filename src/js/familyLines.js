import loadData from './load-data'
import enterView from 'enter-view';

const $section = d3.select('.familyLines');
const $family__container = $section.select('.family__figure');
const $canvas__container = $family__container.select('.canvasContainer');
const $familyHist__svg = $family__container.select('svg.familyBars_svg');

const $replay__btn = $section.select('.replay');
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
let fam_num = 0;

let dataByFamily;
let totalLines;

// scales
const quintileNames = ["Lower", "Lower Middle", "Middle", "Upper Middle", "Upper"];

const scaleX_line = d3.scaleLinear()
	// .domain([0, 40])
	.range([margin.left, margin.left + familyLines_width]);

const scaleY_line = d3.scaleLinear()
	.domain([0, 100])
	.range([height, 0]);

const scaleX_hist = d3.scaleLinear()
	.domain([0, 150])
	.range([0, familyHist_width]);

const scaleX_hist_breakpoints = [500, 1000, 5000, 10000, 20000, 30000, 43000];
let scaleX_hist_breakpoints_copy = scaleX_hist_breakpoints.slice();

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
	dataByFamily = d3.nest()
		.key(d => d.id)
		.entries(result);

	totalLines = dataByFamily.length;

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
		enter: function() { timer = setTimeout(animateLines, ms_slow); },
		once: true,
	});

	// event handlers
	$replay__btn.on('click', () => replay());
	$skipToEnd__btn.on('click', () => showEnd(countsArray));

}).catch(console.error);

function animateLines() {
	if(fam_num < totalLines) {
	// if(fam_num < 100) {
		if(fam_num < maxLines) {
			animate(dataByFamily, fam_num, ms_slow);
			timer = setTimeout(animateLines, ms_slow);
		}
		else {
			animate(dataByFamily, fam_num, ms_fast);
			timer = setTimeout(animateLines, ms_fast);
		}
	}
	fam_num++;
}

function animate(data, fam_num, ms) {
	// animation function for the first few lines where multiple lines appear on the plot at once
	// when the next line is drawn, reduce the opacity of previously drawn line and remove the
	// line entirely when ten more lines are drawn afterwards
	$context.clearRect(0, 0, $canvas.attr('width'), $canvas.attr('height'));

	addQuintileBackground();

	$context.beginPath();
	line(data[fam_num].values);
	$context.strokeStyle = 'rgba(28, 28, 28, 1)';
	$context.stroke();

	// for the first few lines, when the current line is drawn, fade out the
	// nine previously drawn lines
	if(fam_num < maxLines) {
		for(let i = fam_num - 1; i >= 0; i--) {
			$context.beginPath();
			line(data[i].values);
			$context.strokeStyle = 'rgba(28, 28, 28, 0.2)';
			$context.stroke();
		}
	}

	updateHistogram(data, fam_num, ms);
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
		scaleX_hist.domain([0, scaleX_hist_breakpoints_copy[0]]);
		scaleX_hist_breakpoints_copy.shift();

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

function replay() {

	// cancel current timer and clear canvas
	clearTimeout(timer);
	$context.clearRect(0, 0, $canvas.attr('width'), $canvas.attr('height'));
	addQuintileBackground();

	// reset histogram to zero
	scaleX_hist.domain([0, 150]);
	scaleX_hist_breakpoints_copy = scaleX_hist_breakpoints.slice();

	histData = [{quintile: 'Lower', n: 0},
		{quintile: 'Lower Middle', n: 0},
		{quintile: 'Middle', n: 0},
		{quintile: 'Upper Middle', n: 0},
		{quintile: 'Upper', n: 0}];

	$familyHist__vis.selectAll(".axis.axis--x")
		.transition()
		.call(d3.axisBottom(scaleX_hist).ticks(4));

	$bars.data(histData)
		.transition()
		.duration(500)
		.attr('width', d => scaleX_hist(d.n));

	// restart animation
	fam_num = 0;
	timer = setTimeout(animateLines, ms_slow);
}

function showEnd(countsArray) {
	// when user clicks the button to skip the animation, cancel the timer, clear canvas
	// (but redraw background) and show the histogram with data from all families
	clearTimeout(timer);

	$context.clearRect(0, 0, $canvas.attr('width'), $canvas.attr('height'));
	addQuintileBackground();

	scaleX_hist.domain([0, scaleX_hist_breakpoints[scaleX_hist_breakpoints.length - 1]]);

	$familyHist__vis.selectAll(".axis.axis--x")
		.transition()
		.call(d3.axisBottom(scaleX_hist).ticks(4));

	$bars.data(countsArray)
		.transition()
		.duration(500)
		.attr('width', d => scaleX_hist(d.n));
}
