/*
* @Author: Oleg Orlov
* @Date:   2015-09-25 12:29:19
*/

import d3 from 'd3';

import LineChart from './LineChart';
import f from '_utils/prepareData';

export default class MultiLineChart extends LineChart {
  onBrush() {
    this.x.domain(this.brush.empty() ? this.xBrush.domain() : this.brush.extent());

    const updatedAxisX = this.createAxisX(this.x);
    this.svg.selectAll('g.x.axis.chart')
      .call(updatedAxisX);

    this.parts.selectAll('path')
      .attr('d', f('data', this.line));

    this.parts.selectAll('.dot')
      .attr('cx', this.line.x())
      .attr('cy', this.line.y());
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

    this.color.domain(d3.keys(data));
    const groups = this.color.domain().map(name => ({
      name,
      data: data[name],
    }));

    this.x.domain([
      d3.min(groups, part => d3.min(part.data, f('date'))),
      d3.max(groups, part => d3.max(part.data, f('date'))),
    ]);
    this.y.domain([
      0,
      d3.max(groups, part => d3.max(part.data, f('value'))),
    ]);
    this.xBrush.domain(this.x.domain());
    this.yBrush.domain(this.y.domain());

    this.svg = d3.select(this.el)
      .append('svg')
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

    this.parts = this.svg.selectAll('.part')
      .data(groups)
      .enter().append('g')
      .attr('class', 'part');

    this.parts.append('path')
      .attr('class', 'line')
      .attr('clip-path', 'url(#clip)')
      .attr('d', f('data', this.line))
      .style('stroke', f('name', this.color));

    this.parts.append('text')
      .datum(d => ({name: d.name, data: d.data[d.data.length - 1]}))
      .attr('transform', d => `translate(${this.props.width}, ${this.line.y()(d.data)})`)
      .attr('x', 5)
      .attr('dy', '.35em')
      .style('fill', f('name', this.color))
      .text(f('name'));

    this.parts.append('g')
      .attr('class', 'dots')
      .attr('clip-path', 'url(#clip)')
      .style('stroke', f('name', this.color))
      .selectAll('.dot')
      .data(f('data'))
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('r', 4)
      .attr('cx', this.line.x())
      .attr('cy', this.line.y())
      .on('mouseover', ::this.onMouseOver)
      .on('mousemove', ::this.onMouseMove)
      .on('mouseout', ::this.onMouseOut);

    const context = this.svg.append('g')
      .attr('transform', `translate(0, ${marginBrush})`);

    context.append('g')
      .attr('class', 'x axis brush')
      .attr('transform', `translate(0, ${this.props.heightBrush})`)
      .call(xBrushAxis);

    this.brushs = context.append('g');

    this.brushs.selectAll('.area')
      .data(groups)
      .enter().append('path')
      .attr('class', 'area')
      .attr('d', f('data', this.brushArea))
      .style('fill', f('name', this.color));

    context.append('g')
      .attr('class', 'brush')
      .call(this.brush)
      .selectAll('rect')
      .attr('height', this.props.heightBrush);

    context.selectAll('.resize').append('path').attr('d', ::this.brushResizePath);

    if (this.showTooltips) {
      this.addTooltips();
    }
  }

  update(data) {
    this.color.domain(d3.keys(data));
    const groups = this.color.domain().map(name => ({
      name,
      data: data[name],
    }));

    // Recalculate domain given new data
    this.x.domain([
      d3.min(groups, part => d3.min(part.data, f('date'))),
      d3.max(groups, part => d3.max(part.data, f('date'))),
    ]);
    this.y.domain([
      0,
      d3.max(groups, part => d3.max(part.data, f('value'))),
    ]);
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

    this.parts.data(groups);

    this.parts.select('path')
      .transition().duration(this.transitionDuration)
      .attr('d', f('data', this.line));

    this.parts.select('text')
      .text(f('name'));

    this.parts.select('.dots')
      .selectAll('.dot')
      .data(f('data'))
      .transition().duration(this.transitionDuration)
      .attr('cx', this.line.x())
      .attr('cy', this.line.y());

    this.brushs.selectAll('.area')
      .data(groups)
      .transition().duration(this.transitionDuration)
      .attr('d', f('data', this.brushArea));
  }
}
