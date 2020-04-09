import loadData from './load-data'

const $section = d3.select('.familyLines');
const $family__container = $section.select('.family__figure');
const $family__svg = $family__container.select('svg');

// dimensions
const margin = {top: 20, bottom: 40, left: 38, right: 0};
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
// const colorScale =

// console.log($guess__container.node().offsetWidth, $guess__container.node().offsetHeight)

let $family__vis = $family__svg.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom)
	.append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

loadData('line_chart_data.csv').then(result => {
	console.log(result);
}).catch(console.error);
