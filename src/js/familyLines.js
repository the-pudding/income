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

// scales
const scaleX_line = d3.scaleLinear()
	// .domain([0, 40])
	.range([0, familyLines_width]);

const scaleY_line = d3.scaleLinear()
	.domain([0, 100])
	.range([height, 0]);

const scaleX_hist = d3.scaleLinear()
	.domain([0, 100])  // need to make this dynamic
	.range([0, familyHist_width]);

const scaleY_hist = d3.scaleBand()
	.domain(["Lower", "Lower Middle", "Middle", "Upper Middle", "Upper"])
	.range([height, 0]);

const colorScale = d3.scaleOrdinal()
	.domain(["Lower", "Lower Middle", "Middle", "Upper Middle", "Upper"])
	.range(["#f9cdce", "#fbdddd", "#fcf5db", "#e1f5ea", "#d4f1df"]);

const line = d3.line()
    // .defined(function(d) { return !isNaN(d.enrollment) && d.enrollment >= 0; })
    .x(d => scaleX_line(d.year))
    .y(d => scaleY_line(d.pctile))
    .curve(d3.curveStepAfter);

// console.log($guess__container.node().offsetWidth, $guess__container.node().offsetHeight)

// initial data for the histogram
let histData = [{quintile: 'Lower', n: 10},
	{quintile: 'Lower Middle', n: 10},
	{quintile: 'Middle', n: 10},
	{quintile: 'Upper Middle', n: 10},
	{quintile: 'Upper', n: 10}];

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
	console.log(result);
	// nest data because that's the structure d3 needs to make line charts
	let dataByFamily = d3.nest()
		.key(d => d.id)
		.entries(result);

	scaleX_line.domain([0, d3.max(result, d => +d.year)]).nice();
	// console.log(dataByFamily);

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
		.data(dataByFamily.filter((d, i) => i < 10)) // just plot a subset of the data for now
		.enter()
		.append('path')
		.attr('class', (d, i) => 'line family_' + i)
		.attr('d', d => line(d.values))
		.style('opacity', (d, i) => (i === 0) ? 1 : 0); // maybe draw all the lines on initial chart load but hide all of them except the first one, then when the timer starts, just unveil each line one by one (i.e., set their opacity to 1) instead of updating the data bound to the svg

	let fam_num = 1;

	let t = d3.interval(function(elapsed) {
		$lines.select('.line.family_' + fam_num)
			.transition(800)
			.style('opacity', 1);

		fam_num++;
		if (fam_num === 10) t.stop();
	}, 500);

}).catch(console.error);
