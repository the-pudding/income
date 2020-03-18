const $section = d3.select('.guessMovement');
const $container = $section.select('figure');
const $svg = $container.select('svg');

const answerData = []; // fill in with actual numbers later
let guessData = [20, 20, 20, 20, 20];

// dimensions
const margin = {top: 20, bottom: 40, left: 38, right: 0};
let width = $container.node().offsetWidth - margin.left - margin.right;
let height = $container.node().offsetHeight - margin.top - margin.bottom;

// scales
const scaleX = d3.scaleBand()
	.domain([0, 1, 2, 3, 4])
	.range([0, width])
	.paddingInner(0.2)
	.paddingOuter(0.3);

const scaleY = d3.scaleLinear()
	.domain([0, 100])
	.range([height, 0]);

console.log($container.node().offsetWidth, $container.node().offsetHeight)

let $vis = $svg.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom)
	.append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

let $brush = d3.brushY()
	.extent(function(d, i) {
		return [[scaleX(i), 0],[scaleX(i) + scaleX.bandwidth(), height]];
	})
	.on('brush', brushMove)
	.on('end', brushEnd);

let $bars = $vis.selectAll('.brush')
	.data(guessData)
	.enter()
	.append('g')
	.attr('class', 'brush')
	.append('g')
	.call($brush)
	.call($brush.move, function(d) { return [d, 0].map(scaleY); });

	// .attr('x', function(d, i) { return scaleX(i); })
	// .attr('y', function(d, i) { return scaleY(d); })
	// .attr('height', function(d, i) { return (scaleY(0)) - scaleY(d); })
	// .attr('width', scaleX.bandwidth())
	// .style('fill', '#d2d2d2');

function brushMove() {}
function brushEnd() {}
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
