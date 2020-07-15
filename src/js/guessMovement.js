const $section = d3.select('.guessMovement');
const $guess__container = $section.select('.guess__figure');
const $guess__svg = $guess__container.select('svg');
const $instruction2 = $guess__container.select('.instruction2');
const $warningMsg = $guess__container.select('.warningMsg');
const $interpretText = $guess__container.select('.interpretText');
const $submitBtn = $section.select('.submitBtn');
const $answer__container = $section.select('.answer__figure');
const $answer__svg = $answer__container.select('svg');

let $brush;
let $bars;
let $guess__vis;
let $answer__vis;
let $answer__bars;


const answerData = [{levels: 0, share: 0.6},
				 	{levels: 1, share: 11.1},
					{levels: 2, share: 44.2},
					{levels: 3, share: 29.5},
					{levels: 4, share: 14.5}];

let guessData = [{levels: 0, share: 10},
				 {levels: 1, share: 10},
				 {levels: 2, share: 10},
				 {levels: 3, share: 10},
				 {levels: 4, share: 10}];

// dimensions
const margin = {top: 20, bottom: 50, left: 46, right: 0};
let width = 0;
let height = 0;

// scales
const scaleX = d3.scaleBand()
	.domain([0, 1, 2, 3, 4])
	.paddingInner(0.2)
	.paddingOuter(0.6);

const scaleY = d3.scaleLinear()
	.domain([0, 100]);


// console.log($guess__container.node().offsetWidth, $guess__container.node().offsetHeight)
function setup() {
	// set up chart
	width = $guess__container.node().offsetWidth - margin.left - margin.right;
	height = $guess__container.node().offsetHeight - margin.top - margin.bottom;
	scaleX.range([0, width]);
	scaleY.range([height, 0]);

	$guess__vis = $guess__svg.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	// add axes
	$guess__vis.append('g')
		.attr('class', 'axis axis--x')
		.attr('transform', 'translate(0,' + height + ')')
		.call(d3.axisBottom(scaleX))
		.append('text')
		.attr('class', 'axisTitle')
		.attr('x', width / 2)
		.attr('y', margin.bottom - 2)
		.text('Furthest Quintiles Moved')
		.style('fill', '#000');

	$guess__vis.append('g')
		.attr('class', 'axis axis--y')
		.attr('transform', 'translate(-' + margin.left + ', 0)')
		.call(d3.axisRight(scaleY).ticks(5).tickFormat(d => d === 100 ? d + '% of families' : d + '%').tickSize(width + margin.left))
		.selectAll('text')
			.attr('x', 0)
			.attr('dy', 14)
			.style('text-anchor', 'start');

	// set up brushes for user-dragged bars
	$brush = d3.brushY()
		.extent(function(d, i) {
			return [[scaleX(d.levels), 0],[scaleX(d.levels) + scaleX.bandwidth(), height]];
		})
		.on('brush', brushMove)
		.on('end', brushEnd);

	$bars = $guess__vis.selectAll('.brush')
		.data(guessData)
		.enter()
		.append('g')
		.attr('class', 'brush')
		.append('g')
		.call($brush)
		.call($brush.move, function(d) { return [d.share, 0].map(scaleY); }) // this actually draws the "bars"
		.call(g => g.select('.overlay')
			.datum({type: 'selection'})
			.on('mousedown touchstart', resizeBar)
		);

	d3.selectAll(".selection")
		.style("fill", "#124653")
		.style("fill-opacity", "0.8");

	// get rid of handle at the bottom of the bars
	$guess__vis.selectAll('.handle--s').remove();

	// change cursor from the move one to regular auto
	$guess__vis.selectAll('.selection').attr('cursor', 'auto');
	$guess__vis.selectAll('.overlay').attr('cursor', 'auto');

	// disable ability to completely redraw the bar anywhere within its lane
	// $guess__vis.selectAll('.overlay').attr('pointer-events', 'none');

	// set up answer graph
	$answer__vis = $guess__svg.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
		.attr('class', 'answer noDisplay');

	$answer__bars = $answer__vis.selectAll('.answerBar')
		.data(answerData)
		.enter()
		.append('g');

	$answer__bars.append('rect')
		.attr('class', 'answerBar')
		.attr('x', d => scaleX(d.levels))
		.attr('y', d => height)
		.attr('width', scaleX.bandwidth())
		.attr('height', 0);

	$answer__bars.append('text')
		.attr('class', 'answerBarLabel')
		.attr('x', d => scaleX(d.levels) + scaleX.bandwidth()/2)
		.attr('y', d => scaleY(d.share) - 10)
		.text(d => d.share + '%')
		.style('opacity', 0);
}

function resize() {
	// get new dimensions of the container element
	width = $guess__container.node().offsetWidth - margin.left - margin.right;
	height = width < 470 ? (width * 0.7) - margin.top - margin.bottom : (width * 0.54) - margin.top - margin.bottom;
	// height = $guess__container.node().offsetHeight - margin.top - margin.bottom;

	// update scales
	scaleX.range([0, width]);
	scaleY.range([height, 0]);

	// resize chart
	$guess__svg.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom);

	// resize axes
	$guess__vis.selectAll('.axis.axis--x')
		.attr('transform', 'translate(0,' + height + ')')
		.call(d3.axisBottom(scaleX))
		.select('.axisTitle')
			.attr('x', width / 2)
			.attr('y', margin.bottom - 2);

	$guess__vis.selectAll('.axis.axis--y')
		.attr('transform', 'translate(-' + margin.left + ', 0)')
		.call(d3.axisRight(scaleY).ticks(5).tickFormat(d => d === 100 ? d + '% of families' : d + '%').tickSize(width + margin.left))
		.selectAll('text')
			.attr('x', 0);

	// resize brushes
	$brush.extent(function(d, i) {
		return [[scaleX(d.levels), 0],[scaleX(d.levels) + scaleX.bandwidth(), height]];
	});

	$bars.call($brush)
		.call($brush.move, function(d) { return [d.share, 0].map(scaleY); }) ;

	// resize answer bars and labels

	// first determine if the answer is revealed or not - this affects what height to set the bars at
	const answerShown = !$answer__vis.classed('noDisplay');

	$answer__bars.selectAll('.answerBar')
		.attr('x', d => scaleX(d.levels))
		.attr('y', d => answerShown ? scaleY(d.share) : height)
		.attr('width', scaleX.bandwidth())
		.attr('height', d => answerShown ?  height - scaleY(d.share) : 0);

	$answer__bars.selectAll('.answerBarLabel')
		.attr('x', d => scaleX(d.levels) + scaleX.bandwidth()/2)
		.attr('y', d => scaleY(d.share) - 10);
}

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
		guessData[brushedLevel].share = 100 - remainder;
		d3.select(this).call($brush.move, function(d) { return [100 - remainder, 0].map(scaleY); });
		// console.log(guessData);
		$instruction2.style('visibility', 'visible');
	}
    // else, update the dataset with the new value and snap the bar to the nearest integer
    else {
	    guessData[brushedLevel].share = newShare;
	    d3.select(this).call($brush.move, function(d) { return [newShare, 0].map(scaleY); });
		// const sum = d3.sum(guessData, d => d.share);
    }

	updateWarningMsg();
}

function brushEnd() {
	if (!d3.event.sourceEvent) return;  // prevents user from moving the bar entirely (but only after the first brush event has occurred)
    if (d3.event.sourceEvent.type === "brush") return;
    if (!d3.event.selection) {  // in case user makes an empty selection by clicking, not dragging, on the chart, redraw bar at last known height so it doesn't completely disappear
    	$bars.call($brush.move, function(d) { return [d.share, 0].map(scaleY); });
    }
	updateInterpretText();
}

function resizeBar() {
	const clickedY = d3.mouse(this)[1];
	d3.select(this.parentNode)
		.call($brush.move, [clickedY, 0]);
}

function updateWarningMsg() {
	const sum = d3.sum(guessData, d => d.share);
	const diff = 100 - Math.round(sum);

	// if diff < 1, activate the "Submit" button and hide the warning message
	if(Math.abs(diff) < 1) {
		let msg = "You must decrease a bar to increase another"
		$warningMsg.html(msg);
		$submitBtn.attr('aria-disabled', false)
		$instruction2.style('visibility', 'visible');
	}
	else {
		let msg = `Keep going! <strong>${diff}%</strong> of families are still unaccounted`;
		$warningMsg.html(msg);
		$warningMsg.style('visibility', 'visible');
		$submitBtn.attr('aria-disabled', true);
		$instruction2.style('visibility', 'hidden');
	}
}

function updateInterpretText() {
	// figure out which scenario the user has selected and display appropriate message
	let interpretation = '';

	// scenario 1: most families don't move or move very little (bars 0 and 1 > 50%)
	if(guessData[0].share + guessData[1].share > 50) {
		interpretation = "According to you, most families don't move or move very little.";
	}
	// scenario 2: most families move a lot (bars 3 and 4 > 50%)
	else if(guessData[3].share + guessData[4].share > 50) {
		interpretation = "According to you, most families move a lot.";
	}
	// scenario 3: some families move very little, some move a lot (bars at the ends are tall while middle bars are short)
	else if(guessData[2].share < 20) {
		interpretation = "According to you, some families move very little while others move a lot.";
	}
	// scenario 4: most families move a moderate amount (bar 2 > 50%)
	else if(guessData[2].share > 50) {
		interpretation = "According to you, most families move a moderate amount.";
	}
	// scenario 5 (default): roughly equal numbers move a lot as do those that move a little (all bars roughly equal height)
	else {
		interpretation = "According to you, roughly equal numbers of families move a lot as do those that move a little.";
	}

	$interpretText.text(interpretation);
}

// $submitBtn.on('click', showAnswer);

function showAnswer() {
	$answer__vis.classed('noDisplay', false);

	// transition bars to be dotted outlines
	$guess__svg.selectAll('rect.selection')
		.style('fill', 'none')
		.style('stroke', '#124653')
		.style('stroke-dasharray', '4');

	// add overlay so user can't continue to drag bars
	$guess__svg.append('rect')
		.attr('x', margin.left)
		.attr('y', margin.top)
		.attr('width', width)
		.attr('height', height)
		.style('fill', 'rgba(255, 255, 255, 0');

	// make submit button inactive again
	$submitBtn.attr('aria-disabled', true);

	// animate bars in from zero and show labels after all bars finish appearing
	d3.selectAll('.answerBar')
		.transition(1000)
		.delay((d, i) => i * 500)
		.attr('y', d => scaleY(d.share))
		.attr('height', d => height - scaleY(d.share))
		.end()
		.then(() => d3.selectAll('.answerBarLabel').style('opacity', 1));
}

function init() {
	setup();
	$submitBtn.on('click', showAnswer);
}

export default { init, resize };