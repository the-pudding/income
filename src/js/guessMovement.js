const $section = d3.select('.guessMovement');
const $container = $section.select('figure');
const $svg = $container.select('svg');

const answerData = []; // fill in with actual numbers later
let guessData = [20, 20, 20, 20, 20];

// dimensions
const margin = {top: 20, bottom: 40, left: 38, right: 0};
let width = 600 - margin.left - margin.right;
let height = 300 - margin.top - margin.bottom;

// scales
const scaleX = d3.scaleBand()
	.domain([0, 1, 2, 3, 4])
	.range([0, width])
	.paddingInner(0.2)
	.paddingOuter(0.3);

const scaleY = d3.scaleLinear()
	.domain([0, 100])
	.range([height, 0]);

let $vis = $svg.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom)
	.append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

let $bars = $vis.selectAll('.bar')
	.data(guessData)
	.enter()
	.append('rect')
	.attr('class', 'bar')
	.attr('x', function(d, i) { return scaleX(i); })
	.attr('y', function(d, i) { return scaleY(d); })
	.attr('height', function(d, i) { return (scaleY(0)) - scaleY(d); })
	.attr('width', scaleX.bandwidth())
	.style('fill', '#d2d2d2');

$vis.append('g')
	.attr('class', 'axis axis--x')
	.attr('transform', 'translate(0,' + height + ')')
	.call(d3.axisBottom(scaleX))
	.append('text')
	.attr('x', width / 2)
	.attr('y', margin.bottom - 5)
	.text('Levels Moved')
	.style('fill', '#000');

$vis.append('g')
	.attr('class', 'axis axis--y')
	.call(d3.axisLeft(scaleY).ticks(5).tickFormat(d => d + '%'));
