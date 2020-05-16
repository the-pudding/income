import loadData from './load-data'
import enterView from 'enter-view';

const $section = d3.select('.familyLines');
const $family__container = $section.select('.family__figure');
const $canvas__container = $family__container.select('.canvasContainer');
const $familyHist__svg = $family__container.select('svg.familyBars_svg');

const $replay__btn = $section.select('.replay');
const $skipToEnd__btn = $section.select('.skipToEnd');

// dimensions
const DPR = window.devicePixelRatio ? Math.min(window.devicePixelRatio, 2) : 1;
const margin = {top: 20, bottom: 40, left: 140, right: 0};
const margin_hist = {left: 10, right: 20};
let familyLines_width = ($canvas__container.node().getBoundingClientRect().width - margin.left - margin.right) * DPR;
let familyHist_width = ($familyHist__svg.node().getBoundingClientRect().width - margin_hist.left - margin_hist.right) * DPR;
let height = ($family__container.node().offsetHeight - margin.top - margin.bottom) * DPR;

// add in canvas element
const $canvas = $canvas__container.append('canvas')
	.attr('width', familyLines_width + margin.left + margin.right)
	.attr('height', height)
	.style('width', (familyLines_width + margin.left + margin.right)/DPR + "px")
	.style('height', height/DPR + "px");

let $context = $canvas.node().getContext('2d');

// parameters for line chart animation
let timer;
const maxLines = 10;  // max number of lines that should appear on the chart at any given time
let ms_slow = 1000;  // how much time should elapse before the next line is drawn during the slow phase of the animation
let ms_fast = 20; // how much time should elapse during the sped up phase of the animation
// animation will take: (10 * 750) + ((7857-10) * 20) = 164,440 ms or 2.74 min to run
let fam_num = 1;

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
	.domain([0, 20])
	.range([0, familyHist_width]);

const scaleX_hist_breakpoints = [100, 500, 1000, 5000, 10000, 20000, 30000, 43000];
let scaleX_hist_breakpoints_copy = scaleX_hist_breakpoints.slice();

const scaleY_hist = d3.scaleBand()
	.domain(quintileNames)
	.range([height, 0]);

const colorScale = d3.scaleOrdinal()
	.domain(quintileNames)
	.range(["#f9cdce", "#fbdddd", "#fcf5db", "#e1f5ea", "#d4f1df"]);

const line = d3.line()
    // .defined(function(d) { return !isNaN(d.enrollment) && d.enrollment >= 0; })
    .x(d => snapToNearestPoint(scaleX_line(d.year)))
    .y(d => snapToNearestPoint(scaleY_line(d.pctile)))
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
// console.log(dataByFamily[0]);
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

	let firstLineLength = dataByFamily[0].values.length;

	enterView({
		selector: '.family__figure',
		offset: 0.5,
		enter: function() {
			drawFirstLine();
			// timer = setTimeout(animateLines, (firstLineLength + 1) * ms_slow);
			// timer = setTimeout(animateLines, 0);
		},
		once: true,
	});

	// event handlers
	$replay__btn.on('click', () => replay());
	$skipToEnd__btn.on('click', () => showEnd(countsArray));

}).catch(console.error);

function drawFirstLine() {
	// loop through data, call canvas to draw incrementally to add next year of data to line
	// then update histogram
	let firstLineData = dataByFamily[0].values;
	let length = 0;
	let tweenTimer;
	// let timer2 = setTimeout(drawSegment, ms_slow);
	drawSegment();

	function drawSegment() {
		if(length < firstLineData.length) {
			// drawLine(firstLineData.slice(length - 1, length + 1), 1);

			// let lineLength = 0;

				// console.log(firstLineData[length - 1], firstLineData[length]);
				let t0 = length > 0 ? firstLineData[length - 1] : firstLineData[0];
				let t1 = firstLineData[length];
				let x0 = snapToNearestPoint(scaleX_line(t0.year));
				let x1 = snapToNearestPoint(scaleX_line(t1.year));
				let y0 = snapToNearestPoint(scaleY_line(t0.pctile));
				let y1 = snapToNearestPoint(scaleY_line(t1.pctile));
				let switchToY = (x1 - x0) / ((x1 - x0) + Math.abs(y1 - y0));  // get proportion of time that should be spent animating x versus y by taking ratio of x length to total line segment length
				let prevt = 0;

				let tweenTimer = d3.timer((elapsed) => {
					const t = Math.min(1, elapsed/ms_slow);

					// drawLine(firstLineData.slice(length - 1, length + 1), 1);

					$context.beginPath();

					// if t < proportion, only animate x from x0 to x1 (while y = y0)
					if(t < switchToY) {
						$context.moveTo(x0 * (1 - prevt) + x1 * prevt, y0);
						$context.lineTo(x0 * (1 - t) + x1 * t, y0);
					}
					// else, if t > proportion, only animate y from y0 to y1 (while x = x1)
					else {
						$context.moveTo(x1, y0 * (1 - prevt) + y1 * prevt);
						$context.lineTo(x1, y0 * (1 - t) + y1 * t);
					}

					$context.lineWidth = 1;
					$context.strokeStyle = 'rgba(28, 28, 28, 1)';
					$context.stroke();

					prevt = t;

					if(t === 1) {
						tweenTimer.stop();
						drawSegment();
					}
				})
			}

			updateHistogram(firstLineData.slice(length, length + 1), ms_slow / 2);

			// timer2 = setTimeout(drawSegment, ms_slow);

		length++;
	}
}

function animateLines() {
	// if(fam_num < totalLines) {
	if(fam_num < 100) {
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

	// for the first few lines, first fade out the nine previously drawn lines
	if(fam_num < maxLines) {
		for(let i = fam_num - 1; i >= 0; i--) {
			drawLine(data[i].values, 0.1);
		}
	}

	drawLine(data[fam_num].values, 1);

	updateHistogram(data[fam_num].values, ms);
}

function updateHistogram(data, time) {
	// update histogram
	updateHistData(data);

	// check if we need to update histogram's scaleX
	updateHistScaleX();

	$bars.data(histData)
		.transition()
		.duration(time)
		.attr('width', d => scaleX_hist(d.n));
}

function drawLine(data, opacity) {
	// given data, draws a line using canvas by feeding the data to d3's line generator

	$context.beginPath();
	line(data);
	$context.lineWidth = 1;
	$context.strokeStyle = `rgba(28, 28, 28, ${opacity})`;
	$context.stroke();
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
	scaleX_hist.domain([0, 20]);
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
	fam_num = 1;
	let firstLineLength = dataByFamily[0].values.length;
	drawFirstLine();
	timer = setTimeout(animateLines, firstLineLength * ms_slow);
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

function snapToNearestPoint(value) {
	// rounds pixel value to nearest half point
	// needed to improve sharpness of lines in canvas
	return Math.round(value) + 0.5;
}