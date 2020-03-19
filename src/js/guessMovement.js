const $section = d3.select('.guessMovement');
const $container = $section.select('figure');
const $svg = $container.select('svg');

const answerData = []; // fill in with actual numbers later
let guessData = [{levels: 0, share: 20},
				 {levels: 1, share: 20},
				 {levels: 2, share: 20},
				 {levels: 3, share: 20},
				 {levels: 4, share: 20}];

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

// console.log($container.node().offsetWidth, $container.node().offsetHeight)

let $vis = $svg.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom)
	.append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

let $brush = d3.brushY()
	.extent(function(d, i) {
		return [[scaleX(d.levels), 0],[scaleX(d.levels) + scaleX.bandwidth(), height]];
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
	.call($brush.move, function(d) { return [d.share, 0].map(scaleY); });

// get rid of handle at the bottom of the bars
$vis.selectAll('.handle--s').remove();

// change cursor from the move one to regular auto
$vis.selectAll('.selection').attr('cursor', 'auto');
$vis.selectAll('.overlay').attr('cursor', 'auto');

function brushMove() {
	if (!d3.event.sourceEvent) return;  // prevents user from moving the bar entirely
    if (d3.event.sourceEvent.type === "brush") return;
    // if (!d3.event.selection) return;  // what does this do?
}
function brushEnd() {
	if (!d3.event.sourceEvent) return;  // prevents user from moving the bar entirely
    if (d3.event.sourceEvent.type === "brush") return;
    if (!d3.event.selection) {  // in case user clicks the chart but doesn't move, so the bar doesn't completely disappear
    	$bars.call($brush.move, function(d) { return [d.share, 0].map(scaleY); });
    }
    const newBarPos = d3.event.selection.map(scaleY.invert);  // returns an array mapping the bottom and top locations of the bar to their scaleY values
    const newShare = newBarPos[0];
    const brushedBar = d3.select(this).select('.selection'); //  gets the node of the bar that was brushed
    brushedBar.datum().share = newShare;

    // update dataset with new value - needed so we can calculate total later
    const brushedLevel = brushedBar.datum().levels;
    guessData[brushedLevel].share = newShare;

	console.log(guessData); // d0[0] gets you the scaleY value of the new top of the bar
}

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
