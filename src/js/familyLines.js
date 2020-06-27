import enterView from 'enter-view';
import loadData from './load-data';

const $section = d3.select('.familyLines');
const $family__container = $section.select('.family__figure');
const $canvas__container = $family__container.select('.canvasContainer');
const $familyHist__svg = $family__container.select('svg.familyBars_svg');
const $family_smallMultiples__container = $section.select('.family_smallMultiples__figure');
const $familyHist_white__svg = $family_smallMultiples__container.select('svg.familyBars_white_svg');
const $familyHist_black__svg = $family_smallMultiples__container.select('svg.familyBars_black_svg');
const $familyHist_latino__svg = $family_smallMultiples__container.select('svg.familyBars_latino_svg');
const $familyHist_asian__svg = $family_smallMultiples__container.select('svg.familyBars_asian_svg');
const $familyHist_multi__svg = $family_smallMultiples__container.select('svg.familyBars_multi_svg');
const $familyHist_native__svg = $family_smallMultiples__container.select('svg.familyBars_native_svg');

const $replay__btn = $section.select('.replay');
const $skipToEnd__btn = $section.select('.skipToEnd');

// dimensions
const DPR = window.devicePixelRatio ? Math.min(window.devicePixelRatio, 2) : 1;
const margin = { top: 40, bottom: 24, left: 114, right: 5 };
const margin_hist = { left: 0, right: 55 };
let familyLines_width = 0;
let familyHist_width = 0;
let familyHist_sm_width = 0;
let height = 0;
let height_sm = 0;

let $canvas_bg;
let $context_bg;
let $canvas;
let $context;

let $familyHist__vis;
let $bar_group;
let $bars;
let $bar_labels;

// parameters for line chart animation
let timer;
let tweenTimer;
const maxLines = 10; // max number of lines that should appear on the chart at any given time
const ms_slow = 1000; // how much time should elapse before the next line is drawn during the slow phase of the animation
const ms_fast = 20; // how much time should elapse during the sped up phase of the animation
// animation will take: (30 * 1000) + (10 * 1000) + ((7857-10) * 20) = 196,940 ms or 3.28 min to run
let fam_num = 1;

let dataByFamily;
let totalLines;

// scales
const quintileNames = [
  'Lower',
  'Lower Middle',
  'Middle',
  'Upper Middle',
  'Upper',
];

const scaleX_line = d3
  .scaleLinear();

const scaleY_line = d3
  .scaleLinear()
  .domain([0, 100]);

const scaleX_hist = d3
  .scaleLinear()
  .domain([0, 20]);

const scaleX_hist_sm = d3
  .scaleLinear();

const scaleX_hist_breakpoints = [
  100,
  500,
  1000,
  5000,
  10000,
  20000,
  30000,
  43000,
];
let scaleX_hist_breakpoints_copy = scaleX_hist_breakpoints.slice();

const scaleY_hist = d3
  .scaleBand()
  .domain(quintileNames);

const scaleY_hist_sm = d3
  .scaleBand()
  .domain(quintileNames);

const colorScale = d3
  .scaleOrdinal()
  .domain(quintileNames)
  .range(['#FFBFBF', '#FF8850', '#FEE074', '#00A08F', '#124653']);

let line;

const commaFmt = d3.format(',.0f');

// initial data for the histogram
let histData = [
  { quintile: 'Lower', n: 0 },
  { quintile: 'Lower Middle', n: 0 },
  { quintile: 'Middle', n: 0 },
  { quintile: 'Upper Middle', n: 0 },
  { quintile: 'Upper', n: 0 },
];
const histData_white = [
  { quintile: 'Lower', n: 9109 },
  { quintile: 'Lower Middle', n: 17855 },
  { quintile: 'Middle', n: 26135 },
  { quintile: 'Upper Middle', n: 28805 },
  { quintile: 'Upper', n: 23702 },
];
const histData_black = [
  { quintile: 'Lower', n: 12439 },
  { quintile: 'Lower Middle', n: 14583 },
  { quintile: 'Middle', n: 13305 },
  { quintile: 'Upper Middle', n: 9156 },
  { quintile: 'Upper', n: 3963 },
];
const histData_latino = [
  { quintile: 'Lower', n: 807 },
  { quintile: 'Lower Middle', n: 1444 },
  { quintile: 'Middle', n: 1581 },
  { quintile: 'Upper Middle', n: 1134 },
  { quintile: 'Upper', n: 661 },
];
const histData_asian = [
  { quintile: 'Lower', n: 55 },
  { quintile: 'Lower Middle', n: 124 },
  { quintile: 'Middle', n: 199 },
  { quintile: 'Upper Middle', n: 167 },
  { quintile: 'Upper', n: 219 },
];
const histData_multi = [
  { quintile: 'Lower', n: 418 },
  { quintile: 'Lower Middle', n: 615 },
  { quintile: 'Middle', n: 918 },
  { quintile: 'Upper Middle', n: 851 },
  { quintile: 'Upper', n: 578 },
];
const histData_native = [
  { quintile: 'Lower', n: 88 },
  { quintile: 'Lower Middle', n: 95 },
  { quintile: 'Middle', n: 114 },
  { quintile: 'Upper Middle', n: 97 },
  { quintile: 'Upper', n: 55 },
];

function setup() {
  // dimensions
  familyLines_width =
    ($canvas__container.node().getBoundingClientRect().width -
      margin.left -
      margin.right) *
    DPR;
  familyHist_width =
    ($familyHist__svg.node().getBoundingClientRect().width -
      margin_hist.left -
      margin_hist.right) *
    DPR;
  familyHist_sm_width =
    ($familyHist_white__svg.node().getBoundingClientRect().width -
      margin_hist.left -
      margin_hist.right);
  height = (($canvas__container.node().getBoundingClientRect().height) - margin.top - margin.bottom) * DPR;
  height_sm = familyHist_sm_width * 1.7 - margin.top - margin.bottom;

  // set up canvases - one for the background, one for the line
  $canvas_bg = $canvas__container
    .append('canvas')
    .attr('class', 'background')
    .attr('width', familyLines_width + (margin.left + margin.right) * DPR)
    .attr('height', height + (margin.top + margin.bottom) * DPR)
    .style('width', `${(familyLines_width / DPR) + margin.left + margin.right}px`)
    .style('height', `${(height / DPR) + margin.top + margin.bottom}px`);

  $context_bg = $canvas_bg.node().getContext('2d');

  $canvas = $canvas__container
    .append('canvas')
    .attr('class', 'line')
    .attr('width', familyLines_width + (margin.left + margin.right) * DPR)
    .attr('height', height + (margin.top + margin.bottom) * DPR)
    .style('width', `${(familyLines_width / DPR) + margin.left + margin.right}px`)
    .style('height', `${(height / DPR) + margin.top + margin.bottom}px`);

  $context = $canvas.node().getContext('2d');

  // scales
  scaleX_line.range([(margin.left * DPR), (margin.left * DPR) + familyLines_width]);
  scaleY_line.range([height + (margin.top * DPR), (margin.top * DPR)]);

  scaleX_hist.range([0, familyHist_width/DPR]);
  scaleX_hist_sm.range([0, familyHist_sm_width]);
  scaleY_hist.range([height/DPR, 0]);
  scaleY_hist_sm.range([height_sm, 0]);

  // line generator
  line = d3
    .line()
    .x(d => snapToNearestPoint(scaleX_line(d.year)))
    .y(d => snapToNearestPoint(scaleY_line(d.pctile)))
    .curve(d3.curveStepAfter)
    .context($context);

  drawHistogram($familyHist__svg, histData, (familyHist_width / DPR), (height / DPR), scaleX_hist, scaleY_hist, false);
  drawHistogram($familyHist_white__svg, histData_white, familyHist_sm_width, height_sm, scaleX_hist_sm, scaleY_hist_sm, true);
  drawHistogram($familyHist_black__svg, histData_black, familyHist_sm_width, height_sm, scaleX_hist_sm, scaleY_hist_sm, true);
  drawHistogram($familyHist_latino__svg, histData_latino, familyHist_sm_width, height_sm, scaleX_hist_sm, scaleY_hist_sm, true);
  drawHistogram($familyHist_asian__svg, histData_asian, familyHist_sm_width, height_sm, scaleX_hist_sm, scaleY_hist_sm, true);
  drawHistogram($familyHist_multi__svg, histData_multi, familyHist_sm_width, height_sm, scaleX_hist_sm, scaleY_hist_sm, true);
  drawHistogram($familyHist_native__svg, histData_native, familyHist_sm_width, height_sm, scaleX_hist_sm, scaleY_hist_sm, true);
}

function drawHistogram(svg, data, width, height, xScale, yScale, isSmallMultiple) {
  // set the xScale domain for each race small multiple individually
  if(isSmallMultiple) {
    xScale.domain([0, d3.max(data, d => d.n)]);
  }

  $familyHist__vis = svg
    .attr('width', width + margin_hist.left + margin_hist.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin_hist.left},${margin.top})`);

  $bar_group = $familyHist__vis
    .selectAll('.bar_group')
    .data(data)
    .enter()
    .append('g')
    .attr('class', 'bar_group');

  $bars = $bar_group
    .append('rect')
    .attr('class', 'bar')
    .attr('x', 0)
    .attr('y', d => yScale(d.quintile))
    .attr('width', d => xScale(d.n))
    .attr('height', yScale.bandwidth())
    .style('fill', d => colorScale(d.quintile));

  $bar_labels = $bar_group
    .append('text')
    .attr('class', 'label')
    .attr('x', d => isSmallMultiple ? xScale(d.n) + 5 : 5)
    .attr('y', d => yScale(d.quintile) + yScale.bandwidth() / 2)
    .attr('dy', '.5em')
    .text(d => commaFmt(d.n));

  svg
    .append('text')
    .attr('x', margin_hist.left)
    .attr('y', '1em')
    .text('Years in Each Quintile');

  svg
    .append('text')
    .attr('x', margin_hist.left)
    .attr('y', '2.3em')
    .text('(across x families)');
}

function resize() {
  // get new dimensions of the container element
  familyLines_width =
    ($canvas__container.node().getBoundingClientRect().width -
      margin.left -
      margin.right) *
    DPR;
  familyHist_width =
    ($familyHist__svg.node().getBoundingClientRect().width -
      margin_hist.left -
      margin_hist.right) *
    DPR;
  familyHist_sm_width =
    ($familyHist_white__svg.node().getBoundingClientRect().width -
      margin_hist.left -
      margin_hist.right);
  height = ($canvas__container.node().getBoundingClientRect().height - margin.top - margin.bottom) * DPR;
  height_sm = familyHist_sm_width * 1.7 - margin.top - margin.bottom;


  // update scales
  scaleX_line.range([(margin.left * DPR), (margin.left * DPR) + familyLines_width]);
  scaleY_line.range([height + (margin.top * DPR), (margin.top * DPR)]);

  scaleX_hist.range([0, familyHist_width/DPR]);
  scaleY_hist.range([height/DPR, 0]);

  scaleX_hist_sm.range([0, familyHist_sm_width]);
  scaleY_hist_sm.range([height_sm, 0]);

  // line generator
  line = d3
    .line()
    .x(d => snapToNearestPoint(scaleX_line(d.year)))
    .y(d => snapToNearestPoint(scaleY_line(d.pctile)))
    .curve(d3.curveStepAfter)
    .context($context);

  // resize canvases and svg
  $canvas_bg
    .attr('width', familyLines_width + (margin.left + margin.right) * DPR)
    .attr('height', height + (margin.top + margin.bottom) * DPR)
    .style('width', `${(familyLines_width / DPR) + margin.left + margin.right}px`)
    .style('height', `${(height / DPR) + margin.top + margin.bottom}px`);

  $canvas
    .attr('width', familyLines_width + (margin.left + margin.right) * DPR)
    .attr('height', height + (margin.top + margin.bottom) * DPR)
    .style('width', `${(familyLines_width / DPR) + margin.left + margin.right}px`)
    .style('height', `${(height / DPR) + margin.top + margin.bottom}px`);

  // clear current background canvas and redraw with new dimensions
  $context_bg.clearRect(0, 0, $canvas_bg.attr('width'), $canvas_bg.attr('height'));
  addQuintileBackground();

  // update bar lengths and label placements in histograms
  resizeHistogram($familyHist__svg, histData, (familyHist_width / DPR), (height / DPR), scaleX_hist, scaleY_hist, false);
  resizeHistogram($familyHist_white__svg, histData_white, familyHist_sm_width, height_sm, scaleX_hist_sm, scaleY_hist_sm, true);
  resizeHistogram($familyHist_black__svg, histData_black, familyHist_sm_width, height_sm, scaleX_hist_sm, scaleY_hist_sm, true);
  resizeHistogram($familyHist_latino__svg, histData_latino, familyHist_sm_width, height_sm, scaleX_hist_sm, scaleY_hist_sm, true);
  resizeHistogram($familyHist_asian__svg, histData_asian, familyHist_sm_width, height_sm, scaleX_hist_sm, scaleY_hist_sm, true);
  resizeHistogram($familyHist_multi__svg, histData_multi, familyHist_sm_width, height_sm, scaleX_hist_sm, scaleY_hist_sm, true);
  resizeHistogram($familyHist_native__svg, histData_native, familyHist_sm_width, height_sm, scaleX_hist_sm, scaleY_hist_sm, true);
}

function resizeHistogram(svg, data, width, height, xScale, yScale, isSmallMultiple) {
  // set the xScale domain for each race small multiple individually
  if(isSmallMultiple) {
    xScale.domain([0, d3.max(data, d => d.n)]);
  }

  // resize svg container
  let hist = svg
    .attr('width', width + margin_hist.left + margin_hist.right)
    .attr('height', height + margin.top + margin.bottom);

  let bar_group = hist.selectAll('.bar_group');

  bar_group
    .select('.bar')
    .attr('y', d => yScale(d.quintile))
    .attr('width', d => xScale(d.n))
    .attr('height', yScale.bandwidth());

  bar_group
    .select('.label')
    .attr('x', d => xScale(d.n) + 5)
    .attr('y', d => yScale(d.quintile) + yScale.bandwidth() / 2);
}

function drawFirstLine() {
  // loop through data, call canvas to draw incrementally to add next year of data to line
  // then update histogram
  const firstLineData = dataByFamily[0].values;
  let length = 0;

  drawSegment();

  function drawSegment() {
    if (length < firstLineData.length) {
      const t0 = length > 0 ? firstLineData[length - 1] : firstLineData[0];
      const t1 = firstLineData[length];
      const x0 = snapToNearestPoint(scaleX_line(t0.year));
      const x1 = snapToNearestPoint(scaleX_line(t1.year));
      const y0 = snapToNearestPoint(scaleY_line(t0.pctile));
      const y1 = snapToNearestPoint(scaleY_line(t1.pctile));
      const switchToY = (x1 - x0) / (x1 - x0 + Math.abs(y1 - y0)); // get proportion of time that should be spent animating x versus y by taking ratio of x length to total line segment length
      let last_x = x0;
      let last_y = y0;

      tweenTimer = d3.timer(elapsed => {
        const t = Math.min(1, elapsed / ms_slow);
        const next_x = x0 * (1 - t / switchToY) + x1 * (t / switchToY);
        const next_y =
          y0 * ((1 - t) / (1 - switchToY)) +
          y1 * ((t - switchToY) / (1 - switchToY));

        $context.beginPath();

        // if t < proportion, only animate x from x0 to x1 (while y = y0)
        if (t < switchToY) {
          $context.moveTo(last_x, y0);
          $context.lineTo(next_x, y0);

          last_x = next_x;
          last_y = y0;
        }
        // else, if t > proportion, only animate y from y0 to y1 (while x = x1)
        else {
          if (last_x < x1 && next_x >= x1) {
            // if during the last t, the line didn't quite get to x1, complete the horizontal section first
            $context.moveTo(last_x, y0);
            $context.lineTo(x1, y0);
          }

          $context.moveTo(x1, last_y);
          $context.lineTo(x1, next_y);

          last_x = x1;
          last_y = next_y;
        }

        $context.lineWidth = 2;
        $context.strokeStyle = 'rgba(0, 0, 0, 1)';
        $context.stroke();

        if (t === 1) {
          tweenTimer.stop();
          drawSegment();
        }
      });
    }

    updateHistogram(firstLineData.slice(length, length + 1), ms_slow);

    length++;
  }
}

function animateLines() {
  tweenTimer.stop(); // make sure first line animation stops in case user navigates off the page

  if (fam_num < totalLines) {
  // if(fam_num < 100) {
    if (fam_num < maxLines) {
      animate(dataByFamily, fam_num, ms_slow);
      timer = setTimeout(animateLines, ms_slow);
    } else {
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

  // addQuintileBackground();

  // for the first few lines, first fade out the nine previously drawn lines
  if (fam_num < maxLines) {
    for (let i = fam_num - 1; i >= 0; i--) {
      drawLine(data[i].values, 0.1);
    }
  }

  drawLine(data[fam_num].values, 1);

  updateHistogram(data[fam_num].values, ms);
}

function drawLine(data, opacity) {
  // given data, draws a line using canvas by feeding the data to d3's line generator
  $context.beginPath();
  line(data);
  $context.lineWidth = 2;
  $context.strokeStyle = `rgba(0, 0, 0, ${opacity})`;
  $context.stroke();
}

function addQuintileBackground() {
  // shades the part of the plot that corresponds to each quintile with that quintile's color

  // y-axis labels
  $context_bg.font = `${14 * DPR}px "National 2 Narrow Web"`;
  $context_bg.fillStyle = '#828282';
  $context_bg.textAlign = 'end';
  $context_bg.textBaseline = 'bottom';
  $context_bg.fillText(
    'Higher',
    (42 * DPR),
    (margin.top + 23) * DPR
  );
  $context_bg.fillText(
    'income',
    (42 * DPR),
    (margin.top + 37) * DPR
  );
  $context_bg.fillText(
    'Lower',
    (42 * DPR),
    ((margin.top - 24) * DPR) + height
  );
  $context_bg.fillText(
    'income',
    (42 * DPR),
    ((margin.top - 10) * DPR) + height
  );

  // draw arrows
  $context_bg.beginPath();
  $context_bg.moveTo(
    (37 * DPR),
    (margin.top * DPR)
  );
  $context_bg.lineTo(
    (42 * DPR),
    (margin.top + 5) * DPR
  );
  $context_bg.lineTo(
    (32 * DPR),
    (margin.top + 5) * DPR
  );
  $context_bg.fill();

  $context_bg.beginPath();
  $context_bg.moveTo(
    (37 * DPR),
    (margin.top * DPR) + height
  );
  $context_bg.lineTo(
    (42 * DPR),
    ((margin.top - 5) * DPR) + height
  );
  $context_bg.lineTo(
    (32 * DPR),
    ((margin.top - 5) * DPR) + height
  );
  $context_bg.fill();

  // x-axis labels
  $context_bg.textAlign = 'start';
  $context_bg.fillText(
    'Income in first year',
    (margin.left * DPR),
    (margin.top * DPR) + height + (margin.bottom * DPR) - 2
  );

  $context_bg.textAlign = 'end';
  $context_bg.fillText(
    'Income in last year',
    (margin.left * DPR) + familyLines_width,
    (margin.top * DPR) + height + (margin.bottom * DPR) - 2
  );

  // $context.beginPath();
  // $context.moveTo(snapToNearestPoint(margin.left), margin.top + height);
  // $context.lineTo(snapToNearestPoint(margin.left), margin.top + height + 19);
  // $context.lineWidth = 1;
  // $context.strokeStyle = '#828282';
  // $context.stroke();

  // $context.beginPath();
  // $context.moveTo(
  //   snapToNearestPoint(margin.left + familyLines_width - 2),
  //   margin.top + height
  // );
  // $context.lineTo(
  //   snapToNearestPoint(margin.left + familyLines_width - 2),
  //   margin.top + height + 19
  // );
  // $context.lineWidth = 1;
  // $context.strokeStyle = '#828282';
  // $context.stroke();

  quintileNames.forEach((d, i) => {
    const $gradient = $context_bg.createLinearGradient(
      (margin.left * DPR),
      0,
      $canvas_bg.attr('width'),
      0
    );
    $gradient.addColorStop(0, 'white');
    $gradient.addColorStop(1, colorScale(d));
    $context_bg.fillStyle = $gradient;
    $context_bg.fillRect(
      (margin.left * DPR),
      scaleY_line((i + 1) * 20),
      familyLines_width,
      height / 5
    );
  });

  const axisImage = new Image();
  axisImage.src = 'assets/images/familyLines_yAxis.png';
  axisImage.onload = function() {
    $context_bg.drawImage(
      axisImage,
      (50 * DPR),
      (margin.top * DPR),
      height * 0.1, height
    );
  };
}

function updateHistogram(data, time) {
  // update histogram data
  updateHistData(data);

  // check if we need to update histogram's scaleX
  updateHistScaleX();

  // update histogram bars and labels
  let bar_group = $familyHist__svg.selectAll('.bar_group');
  bar_group.data(histData);

  bar_group.selectAll('.bar')
    .transition()
    .delay(time)
    .duration(time)
    .attr('width', d => scaleX_hist(d.n));

  bar_group.selectAll('.label')
    .transition()
    .delay(time)
    .duration(time)
    .attr('x', d => scaleX_hist(d.n) + 5)
    .text(d => commaFmt(d.n));
}

function updateHistScaleX() {
  // updates the ScaleX for the histogram when the number of observations exceeds the current domain bounds
  const dataMax = d3.max(histData, d => d.n);
  const scale_current_max = scaleX_hist.domain()[1];

  if (dataMax > scale_current_max) {
    scaleX_hist.domain([0, scaleX_hist_breakpoints_copy[0]]);
    scaleX_hist_breakpoints_copy.shift();

    // $familyHist__vis
    //   .selectAll('.axis.axis--x')
    //   .transition()
    //   .call(d3.axisBottom(scaleX_hist).tickValues(scaleX_hist.domain()));
  }
}

function updateHistData(data) {
  // updates the data used for the histogram (histData) with the frequencies from one additional family
  const countsObj = countFrequency(data);
  histData.forEach(d => {
    if (d.quintile === 'Lower') d.n += countsObj.Lower;
    else if (d.quintile == 'Lower Middle') d.n += countsObj['Lower Middle'];
    else if (d.quintile == 'Middle') d.n += countsObj.Middle;
    else if (d.quintile == 'Upper Middle') d.n += countsObj['Upper Middle'];
    else if (d.quintile == 'Upper') d.n += countsObj.Upper;
  });
}

function countFrequency(data) {
  // returns an object with the total number of occurrences of a quintile in the data

  // set up an object to hold the counts
  const quintileCountsObj = {};
  quintileNames.forEach(d => (quintileCountsObj[d] = 0));

  // populate the object with frequencies
  data.forEach(d => {
    if (d.quintile === '1') quintileCountsObj.Lower++;
    else if (d.quintile === '2') quintileCountsObj['Lower Middle']++;
    else if (d.quintile === '3') quintileCountsObj.Middle++;
    else if (d.quintile === '4') quintileCountsObj['Upper Middle']++;
    else if (d.quintile === '5') quintileCountsObj.Upper++;
  });

  return quintileCountsObj;
}

function objToArray(obj) {
  // turns the object with quintile frequency counts into an array that d3 prefers
  let quintileArray = [];
  quintileArray = Object.keys(obj).map(key => {
    return { quintile: key, n: obj[key] };
  });

  return quintileArray;
}

function replay() {
  // cancel current timer and clear canvas
  tweenTimer.stop();
  clearTimeout(timer);

  $context.clearRect(0, 0, $canvas.attr('width'), $canvas.attr('height'));
  // addQuintileBackground();

  // reset histogram to zero
  scaleX_hist.domain([0, 20]);
  scaleX_hist_breakpoints_copy = scaleX_hist_breakpoints.slice();

  histData = [
    { quintile: 'Lower', n: 0 },
    { quintile: 'Lower Middle', n: 0 },
    { quintile: 'Middle', n: 0 },
    { quintile: 'Upper Middle', n: 0 },
    { quintile: 'Upper', n: 0 },
  ];

  // $familyHist__vis
  //   .selectAll('.axis.axis--x')
  //   .transition()
  //   .call(d3.axisBottom(scaleX_hist).tickValues([0, 20]));
  let bar_group = $familyHist__svg.selectAll('.bar_group');
  bar_group.data(histData);

  bar_group
    .select('.bar')
    .transition()
    .duration(500)
    .attr('width', d => scaleX_hist(d.n));

  bar_group
    .select('.label')
    .transition()
    .duration(500)
    .attr('x', 5)
    .text(d => commaFmt(d.n));

  // restart animation
  fam_num = 1;
  const firstLineLength = dataByFamily[0].values.length;
  drawFirstLine();
  timer = setTimeout(animateLines, firstLineLength * ms_slow);
}

function showEnd(countsArray) {
  // when user clicks the button to skip the animation, cancel the timer, clear canvas
  // (but redraw background) and show the histogram with data from all families
  tweenTimer.stop();
  clearTimeout(timer);

  $context.clearRect(0, 0, $canvas.attr('width'), $canvas.attr('height'));
  // addQuintileBackground();

  scaleX_hist.domain([
    0,
    scaleX_hist_breakpoints[scaleX_hist_breakpoints.length - 1],
  ]);

  // $familyHist__vis
  //   .selectAll('.axis.axis--x')
  //   .transition()
  //   .call(d3.axisBottom(scaleX_hist).tickValues(scaleX_hist.domain()));

  let bar_group = $familyHist__svg.selectAll('.bar_group');
  bar_group.data(countsArray);

  bar_group
    .select('.bar')
    .transition()
    .duration(500)
    .attr('width', d => scaleX_hist(d.n));

  bar_group
    .select('.label')
    .transition()
    .duration(500)
    .attr('x', d => scaleX_hist(d.n) + 5)
    .text(d => commaFmt(d.n));
}

function snapToNearestPoint(value) {
  // rounds pixel value to nearest half point
  // needed to improve sharpness of lines in canvas
  return Math.round(value);
}
/*
function wrap(text, width) {
  text.each(function() {
    const text = d3.select(this);
    const words = text
      .text()
      .split(/\s+/)
      .reverse();
    let word;
    let line = [];
    let lineNumber = 0;
    const lineHeight = 1.1; // ems
    const y = text.attr('y');
    const dy = 0.3;
    let tspan = text
      .text(null)
      .append('tspan')
      .attr('x', 0)
      .attr('y', y)
      .attr('dy', `${dy}em`);
    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(' '));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(' '));
        line = [word];
        tspan = text
          .append('tspan')
          .attr('x', 0)
          .attr('y', y)
          .attr('dy', `${++lineNumber * lineHeight + dy}em`)
          .text(word);
      }
    }
  });
}
*/
function init() {
  setup();

  loadData('line_chart_data.csv')
    .then(result => {
      // nest data because that's the structure d3 needs to make line charts
      dataByFamily = d3
        .nest()
        .key(d => d.id)
        .entries(result);

      totalLines = dataByFamily.length;

      // set scale domains
      scaleX_line.domain([0, d3.max(result, d => +d.year)]).nice();
      const counts = countFrequency(result);
      const countsArray = objToArray(counts);

      // append axis for debugging purposes
      // $familyLines__vis.append('g')
      //  .attr('class', 'axis axis--y')
      //  .call(d3.axisLeft(scaleY_line));

      // $familyLines__vis.append('g')
      //  .attr('class', 'axis axis--x')
      //  .attr('transform', 'translate(0,' + height + ')')
      //  .call(d3.axisBottom(scaleX_line));

      addQuintileBackground();

      // $familyHist__vis
      //   .append('g')
      //   .attr('class', 'axis axis--x')
      //   .attr('transform', `translate(0,${height})`)
      //   .call(d3.axisBottom(scaleX_hist).tickValues([0, 20]));

      const firstLineLength = dataByFamily[0].values.length;

      enterView({
        selector: '.family__figure',
        offset: 0.5,
        enter() {
          drawFirstLine();
          timer = setTimeout(animateLines, (firstLineLength + 1) * ms_slow);
          // timer = setTimeout(animateLines, 0);
        },
        once: true,
      });

      // event handlers
      $replay__btn.on('click', () => replay());
      $skipToEnd__btn.on('click', () => showEnd(countsArray));
    })
    .catch(console.error);
}

export default { init, resize };