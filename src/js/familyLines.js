import loadData from './load-data'

const $section = d3.select('.familyLines');
const $family__container = $section.select('.family__figure');
const $familyLines__svg = $family__container.select('svg.familyLines_svg');
const $familyHist__svg = $family__container.select('svg.familyBars_svg');

// dimensions
const margin = {top: 20, bottom: 40, left: 140, right: 0};
let familyLines_width = $familyLines__svg.node().getBoundingClientRect().width - margin.left - margin.right;
let familyHist_width = $familyHist__svg.node().getBoundingClientRect().width;
let height = $family__container.node().offsetHeight - margin.top - margin.bottom;

const quintileNames = ["Lower", "Lower Middle", "Middle", "Upper Middle", "Upper"];
// scales
const scaleX_line = d3.scaleLinear()
	// .domain([0, 40])
	.range([0, familyLines_width]);

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
    .curve(d3.curveStepAfter);

// console.log($guess__container.node().offsetWidth, $guess__container.node().offsetHeight)

// initial data for the histogram
let histData = [{quintile: 'Lower', n: 0},
	{quintile: 'Lower Middle', n: 0},
	{quintile: 'Middle', n: 0},
	{quintile: 'Upper Middle', n: 0},
	{quintile: 'Upper', n: 0}];

// set up line chart
let $familyLines__vis = $familyLines__svg.attr('width', familyLines_width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom)
	.append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// color plot background based on quintile
let $background = $familyLines__vis.append('g')
	.selectAll('.quintileBlock')
	.data(colorScale.domain())
	.enter()
	.append('g')
	.attr('class', 'quintileBlock');

$background.append('rect')
	.attr('class', 'quintileRect')
	.attr('x', 0)
	.attr('y', (d, i) => scaleY_line((i + 1) * 20))
	.attr('width', familyLines_width)
	.attr('height', height / 5)
	.style('fill', d => colorScale(d));

// add "y axis"
$background.append('text')
	.attr('class', 'quintileLabel')
	.attr('x', -5)
	.attr('y', (d, i) => scaleY_line(i * 20))
	.attr('dy', '-.5em')
	.text(d => d);

let $lines = $familyLines__vis.append('g');

// // set up histogram
let $familyHist__vis = $familyHist__svg.attr('width', familyHist_width)
	.attr('height', height + margin.top + margin.bottom)
	.append('g')
	.attr('transform', 'translate(0,' + margin.top + ')');

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
	// console.log(dataByFamily.length);

	// set scale domains
	scaleX_line.domain([0, d3.max(result, d => +d.year)]).nice();
	// let counts = countFrequency(result);
	// let countsArray = objToArray(counts);
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

	// draw first line
	$lines.selectAll('.line')
		.data(dataByFamily.filter((d, i) => i < 100)) // just plot a subset of the data for now
		.enter()
		.append('path')
		.attr('class', (d, i) => 'line family_' + i)
		.attr('d', d => line(d.values))
		.style('opacity', (d, i) => (i === 0) ? 1 : 0); // maybe draw all the lines on initial chart load but hide all of them except the first one, then when the timer starts, just unveil each line one by one (i.e., set their opacity to 1) instead of updating the data bound to the svg

	let fam_num = 1;

	// update histogram with first family's data
	updateHistData(dataByFamily[0].values);
	$bars.data(histData)
		.transition()
		.duration(100)
		.attr('width', d => scaleX_hist(d.n));


	// animate chart
	let t = d3.interval(function(elapsed) {
		// unhide line
		$lines.select('.line.family_' + fam_num)
			.transition(500)
			.style('opacity', 1);

		// update histogram
		updateHistData(dataByFamily[fam_num].values);

		// check if we need to update histogram's scaleX
		updateHistScaleX();

		$bars.data(histData)
			.transition()
			.duration(500)
			.attr('width', d => scaleX_hist(d.n));

		fam_num++;
		if (fam_num === 100) t.stop();
	}, 500);

}).catch(console.error);

function updateHistScaleX() {
	// updates the ScaleX for the histogram when the number of observations exceeds the current domain bounds
	const dataMax = d3.max(histData, d => d.n);
	const scale_current_max = scaleX_hist.domain()[1];

	if(dataMax > scale_current_max) {
		scaleX_hist.domain([0, scaleX_hist_breakpoints[0]]);
		scaleX_hist_breakpoints.shift();
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