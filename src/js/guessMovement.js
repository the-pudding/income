const $section = d3.select('.guessMovement');
const $guess__container = $section.select('.guess__figure');
const $guess__svg = $guess__container.select('svg');
const $warningMsg = $guess__container.select('.warningMsg');
const $interpretText = $guess__container.select('.interpretText');
const $submitBtn = $section.select('.submitBtn');
const $answer__container = $section.select('.answer__figure');
const $answer__svg = $answer__container.select('svg');


const answerData = [{levels: 0, share: 0.6},
				 	{levels: 1, share: 11.1},
					{levels: 2, share: 44.2},
					{levels: 3, share: 29.5},
					{levels: 4, share: 14.5}];

let guessData = [{levels: 0, share: 0},
				 {levels: 1, share: 0},
				 {levels: 2, share: 0},
				 {levels: 3, share: 0},
				 {levels: 4, share: 0}];

// dimensions
const margin = {top: 20, bottom: 40, left: 38, right: 0};
let width = $guess__container.node().offsetWidth - margin.left - margin.right;
let height = $guess__container.node().offsetHeight - margin.top - margin.bottom;

// scales
const scaleX = d3.scaleBand()
	.domain([0, 1, 2, 3, 4])
	.range([0, width])
	.paddingInner(0.2)
	.paddingOuter(0.3);

const scaleY = d3.scaleLinear()
	.domain([0, 100])
	.range([height, 0]);

// console.log($guess__container.node().offsetWidth, $guess__container.node().offsetHeight)

let $guess__vis = $guess__svg.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom)
	.append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

let $brush = d3.brushY()
	.extent(function(d, i) {
		return [[scaleX(d.levels), 0],[scaleX(d.levels) + scaleX.bandwidth(), height]];
	})
	.on('brush', brushMove)
	.on('end', brushEnd);

let $bars = $guess__vis.selectAll('.brush')
	.data(guessData)
	.enter()
	.append('g')
	.attr('class', 'brush')
	.append('g')
	.call($brush)
	.call($brush.move, function(d) { return [d.share, 0].map(scaleY); }); // this actually draws the "bars"

// get rid of handle at the bottom of the bars
$guess__vis.selectAll('.handle--s').remove();

// change cursor from the move one to regular auto
$guess__vis.selectAll('.selection').attr('cursor', 'auto');
$guess__vis.selectAll('.overlay').attr('cursor', 'auto');

// disable ability to completely redraw the bar anywhere within its lane
$guess__vis.selectAll('.overlay').attr('pointer-events', 'none');


function brushMove() {
	if (!d3.event.sourceEvent) return;  // prevents user from moving the bar entirely (but only after the first brush event has occurred)
    if (d3.event.sourceEvent.type === "brush") return;
    if (!d3.event.selection) return;  // ignore empty selections

    // determine the new location of the end of the bar and map it to its value
    const newBarPos = d3.event.selection.map(scaleY.invert);  // returns an array mapping the bottom and top locations of the bar to their scaleY values
    const newShare = Math.ceil(newBarPos[0]); // round to make the numbers nicer for the calculations below

    const brushedBar = d3.select(this).select('.selection'); //  gets the node of the bar that was brushed
    // brushedBar.datum().share = newShare;  // need to update the data bound to the bar in case user clicks the chart and the bar needs to be redrawn in its original position
    const brushedLevel = brushedBar.datum().levels;
    const oldShare = brushedBar.datum().share;

    // if user drags bar such that the sum of all the bars is greater than 100, prevent them from continuing to drag
    const remainder = d3.sum(guessData.filter(d => d.levels !== brushedLevel), d => d.share);
	if(newShare + remainder > 100) {
		d3.select(this).call($brush.move, function(d) { return [100 - remainder, 0].map(scaleY); });
		console.log(guessData);
	}
    // else, update the dataset with the new value
    else {
	    guessData[brushedLevel].share = newShare;
	    d3.select(this).call($brush.move, function(d) { return [newShare, 0].map(scaleY); }); // snap the bar to the nearest integer
		// const sum = d3.sum(guessData, d => d.share);
		updateWarningMsg();
    }
}

function brushEnd() {
	if (!d3.event.sourceEvent) return;  // prevents user from moving the bar entirely (but only after the first brush event has occurred)
    if (d3.event.sourceEvent.type === "brush") return;
    if (!d3.event.selection) {  // in case user makes an empty selection by clicking, not dragging, on the chart, redraw bar at last known height so it doesn't completely disappear
    	$bars.call($brush.move, function(d) { return [d.share, 0].map(scaleY); });
    }
	updateInterpretText();
}

function updateWarningMsg() {
	const sum = d3.sum(guessData, d => d.share);
	const diff = 100 - Math.round(sum);
	let msg = diff + "% of families unaccounted for";

	$warningMsg.text(msg);

	$warningMsg.style('visibility', 'visible');

	// if diff < 1, activate the "Submit" button
	(Math.abs(diff) < 1) ? $submitBtn.classed('inactive', false) : $submitBtn.classed('inactive', true);
}

function updateInterpretText() {
	// need some scenarios and ways to calculate which one applies based on the current state of the graph
	$interpretText.text('According to you, roughly equal numbers of families move a lot as do those that move a little.');
}

$guess__vis.append('g')
	.attr('class', 'axis axis--x')
	.attr('transform', 'translate(0,' + height + ')')
	.call(d3.axisBottom(scaleX))
	.append('text')
	.attr('x', width / 2)
	.attr('y', margin.bottom - 5)
	.text('Levels Moved')
	.style('fill', '#000');

$guess__vis.append('g')
	.attr('class', 'axis axis--y')
	.call(d3.axisLeft(scaleY).ticks(5).tickFormat(d => d + '%'));

$submitBtn.on('click', showAnswer);

function showAnswer() {
	$answer__container.classed('noDisplay', false);
	// once we have actual text, also scroll the user down so that they can see the answer chart?
}

/// draw answer graph - TODO finesse this so that the bars transition from zero to the data value (i.e., "grow") after the user clicks the submit button?
let $answer__vis = $answer__svg.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom)
	.append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

let $answer__bars = $answer__vis.selectAll('.answerBar')
	.data(answerData)
	.enter()
	.append('g');

$answer__bars.append('rect')
	.attr('class', 'answerBar')
	.attr('x', function(d) { return scaleX(d.levels); })
	.attr('y', function(d) { return scaleY(d.share); })
	.attr('width', scaleX.bandwidth())
	.attr('height', function(d) { return height - scaleY(d.share); });

$answer__bars.append('text')
	.attr('class', 'answerBarLabel')
	.attr('x', function(d) { return scaleX(d.levels) + scaleX.bandwidth()/2; })
	.attr('y', function(d) { return scaleY(d.share) - 10; })
	.text(function(d) { return d.share + '%'; });

$answer__vis.append('g')
	.attr('class', 'axis axis--x')
	.attr('transform', 'translate(0,' + height + ')')
	.call(d3.axisBottom(scaleX))
	.append('text')
	.attr('x', width / 2)
	.attr('y', margin.bottom - 5)
	.text('Levels Moved')
	.style('fill', '#000');

$answer__vis.append('g')
	.attr('class', 'axis axis--y')
	.call(d3.axisLeft(scaleY).ticks(5).tickFormat(d => d + '%'));