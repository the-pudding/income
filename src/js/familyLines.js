import loadData from './load-data'

const $section = d3.select('.familyLines');
const $family__container = $section.select('.family__figure');
const $family__svg = $family__container.select('svg');

// dimensions
const margin = {top: 20, bottom: 40, left: 38, right: 10};
let width = $family__container.node().offsetWidth - margin.left - margin.right;
let height = $family__container.node().offsetHeight - margin.top - margin.bottom;

// scales
const scaleX_line = d3.scaleLinear()
	.domain([0, 40])
	.range([0, width]);

const scaleY_line = d3.scaleLinear()
	.domain([0, 100])
	.range([height, 0]);

// const scaleX_hist =
// const scaleY_hist =

const colorScale = d3.scaleOrdinal()
	.domain([1, 2, 3, 4, 5])
	.range(["#EB5757", "#EB5757", "#F2C94C", "#6FCF97", "#6FCF97"]);

const line = d3.line()
    // .defined(function(d) { return !isNaN(d.enrollment) && d.enrollment >= 0; })
    .x(d => scaleX_line(d.year))
    .y(d => scaleY_line(d.pctile))
    .curve(d3.curveStepAfter);

// console.log($guess__container.node().offsetWidth, $guess__container.node().offsetHeight)

let $family__vis = $family__svg.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom)
	.append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

loadData('line_chart_data.csv').then(result => {
	// console.log(result);
	// nest data because that's the structure d3 needs to make line charts
	let dataByFamily = d3.nest()
		.key(d => d.id)
		.entries(result);

	// console.log(dataByFamily);

	// append axis - this will need to be changed later to match mockup
	$family__vis.append('g')
		.attr('class', 'axis axis--y')
		.call(d3.axisLeft(scaleY_line));

	$family__vis.append('g')
		.attr('class', 'axis axis--x')
		.attr('transform', 'translate(0,' + height + ')')
		.call(d3.axisBottom(scaleX_line));

	// draw first line
	$family__vis.selectAll('.line')
		.data(dataByFamily.filter((d, i) => i < 20)) // just plot a subset of the data for now
		.enter()
		.append('path')
		.attr('class', (d, i) => 'line family_' + i)
		.attr('d', d => line(d.values))
		.style('opacity', (d, i) => (i === 0) ? 1 : 0); // maybe draw all the lines on initial chart load but hide all of them except the first one, then when the timer starts, just unveil each line one by one (i.e., set their opacity to 1) instead of updating the data bound to the svg

	let fam_num = 1;

	let t = d3.interval(function(elapsed) {
		$family__vis.select('.line.family_' + fam_num)
			.transition(800)
			.style('opacity', 1);

		fam_num++;
		if (fam_num === 20) t.stop();
	}, 500);

}).catch(console.error);
