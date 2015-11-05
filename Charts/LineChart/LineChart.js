/*
* @Author: Oleg Orlov
* @Date:   2015-09-02 15:17:19
*/

import d3 from 'd3';

import BaseChart from '../BaseChart';
import f from '_utils/prepareData';
import './LineChart.css';

export default class LineChart extends BaseChart {
  getScaleX() {
    return d3.time.scale.utc().range([0, this.props.width]);
  }

  getScaleY() {
    return d3.scale.linear().range([this.props.height, 0]);
  }

  getScaleYBrush() {
    return d3.scale.linear().range([this.props.heightBrush, 0]);
  }

  createAxisX(x) {
    return d3.svg.axis().scale(x).ticks(6).tickFormat(this.dateFormat).tickSize(-this.props.height, 6).tickPadding(10).orient('bottom');
  }

  createAxisY(y) {
    return d3.svg.axis().scale(y).ticks(6).tickSize(-this.props.width, 6).tickPadding(10).orient('left');
  }

  createAxisBrushX(x) {
    return d3.svg.axis().scale(x).ticks(6).tickFormat(this.dateFormat).orient('bottom');
  }

  createLine(x, y) {
    return d3.svg.line().interpolate('monotone').x(d => { return x(d.date); }).y(d => { return y(d.value); });
  }

  createBrush(x) {
    return d3.svg.brush().x(x).on('brush', ::this.onBrush);
  }

  createBrushArea(x, y) {
    return d3.svg.area().interpolate('monotone').x(d => { return x(d.date); }).y0(this.props.heightBrush).y1(d => { return y(d.value); });
  }

  brushResizePath(d) {
    const e = +(d === 'e');
    const x = e ? 1 : -1;
    const h = this.props.heightBrush;

    return `M${0.5 * x},0
      A6,6 0 0 ${e} ${6.5 * x},6
      V${h - 6}
      A6,6 0 0 ${e} ${0.5 * x},${h}
      Z
      M${2.5 * x},8
      V${h - 8}
      M${4.5 * x},8
      V${h - 8}`;
  }

  onBrush() {
    this.x.domain(this.brush.empty() ? this.xBrush.domain() : this.brush.extent());

    const updatedAxisX = this.createAxisX(this.x);
    this.svg.selectAll('g.x.axis.chart')
      .call(updatedAxisX);

    this.svg.select('path.line')
      .attr('d', this.line);
    this.svg.selectAll('.dot')
      .attr('cx', this.line.x())
      .attr('cy', this.line.y());
  }

  onMouseOver(d) {
    return this.tooltip
      .style('visibility', 'visible')
      .text(`${this.getDateString(d.date)} (${d.value})`);
  }

  create(data) {
    this.x = this.getScaleX();
    this.y = this.getScaleY();
    this.xBrush = this.getScaleX();
    this.yBrush = this.getScaleYBrush();

    this.line = this.createLine(this.x, this.y);
    this.brush = this.createBrush(this.xBrush);
    this.brushArea = this.createBrushArea(this.xBrush, this.yBrush);

    const xAxis = this.createAxisX(this.x);
    const yAxis = this.createAxisY(this.y);
    const xBrushAxis = this.createAxisBrushX(this.xBrush);

    const marginBrush = this.props.height + this.props.marginBrush;
    const width = this.props.width + this.props.margin.left + this.props.margin.right;
    const height = this.props.margin.top + marginBrush + this.props.heightBrush + this.props.margin.bottom;

    this.svg = d3.select(this.el).append('svg')
      .attr('class', 'lineChart')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${this.props.margin.left}, ${this.props.margin.top})`);

    this.svg.append('defs').append('clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', this.props.width)
      .attr('height', this.props.height);

    this.x.domain(d3.extent(data.map(f('date'))));
    this.y.domain([0, d3.max(data, f('value'))]);
    this.xBrush.domain(this.x.domain());
    this.yBrush.domain(this.y.domain());

    this.svg.append('g')
      .attr('class', 'x axis chart')
      .attr('transform', `translate(0, ${this.props.height})`)
      .call(xAxis);

    this.svg.append('g')
      .attr('class', 'y axis chart')
      .call(yAxis)
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('count');

    this.svg.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('clip-path', 'url(#clip)')
      .attr('d', this.line)
      .style('stroke', this.color());

    this.svg.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('clip-path', 'url(#clip)')
      .attr('cx', this.line.x())
      .attr('cy', this.line.y())
      .style('stroke', this.color())
      .attr('r', 4)
      .on('mouseover', ::this.onMouseOver)
      .on('mousemove', ::this.onMouseMove)
      .on('mouseout', ::this.onMouseOut);

    const context = this.svg.append('g')
      .attr('transform', `translate(0, ${marginBrush})`);

    context.append('path')
      .datum(data)
      .attr('class', 'area')
      .attr('d', this.brushArea)
      .style('fill', this.color());

    context.append('g')
      .attr('class', 'x axis brush')
      .attr('transform', `translate(0, ${this.props.heightBrush})`)
      .call(xBrushAxis);

    context.append('g')
      .attr('class', 'x brush')
      .call(this.brush)
      .selectAll('rect')
      .attr('height', this.props.heightBrush);

    context.selectAll('.resize').append('path').attr('d', ::this.brushResizePath);

    if (this.showTooltips) {
      this.addTooltips();
    }
  }

  update(data) {
    // Recalculate domain given new data
    this.x.domain(d3.extent(data.map(f('date'))));
    this.y.domain([0, d3.max(data, f('value'))]);
    this.xBrush.domain(this.x.domain());
    this.yBrush.domain(this.y.domain());

    // We now have an updated Y axis
    const updatedAxisY = this.createAxisY(this.y);
    const updatedAxisX = this.createAxisX(this.x);
    const updateBrushAxisX = this.createAxisBrushX(this.xBrush);

    // Let's update the x & y axis
    this.svg.selectAll('g.y.axis.chart').call(updatedAxisY);
    this.svg.selectAll('g.x.axis.chart').call(updatedAxisX);
    this.svg.selectAll('g.x.axis.brush').call(updateBrushAxisX);

    this.svg.select('path.line')
      .datum(data)
      .transition().duration(this.transitionDuration)
      .attr('d', this.line);

    this.svg.selectAll('.dot')
      .data(data)
      .transition().duration(this.transitionDuration)
      .attr('cx', this.line.x())
      .attr('cy', this.line.y());

    this.svg.select('path.area')
      .datum(data)
      .transition().duration(this.transitionDuration)
      .attr('d', this.brushArea);
  }
}
