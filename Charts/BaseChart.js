/*
* @Author: Oleg Orlov
* @Date:   2015-09-01 12:29:19
*/

import d3 from 'd3';

import './BaseChart.css';

const chartConfig = {
  showTooltips: true,
  transitionDuration: 1000,
};

export default class BaseChart {
  constructor(el, props) {
    this.el = el;
    this.props = props;
    this.color = this.getColor();
    this.dateFormat = this.getDateFormat();

    Object.keys(chartConfig).forEach(configKey => {
      // If a prop is defined, let's just use it, otherwise
      // fall back to the default.
      if (this.props[configKey] !== undefined) {
        this[configKey] = this.props[configKey];
      } else {
        this[configKey] = chartConfig[configKey];
      }
    });
  }

  // Overwrite this function to apply your own color scheme
  getColor() {
    return d3.scale.category10();
  }

  getDateFormat() {
    return d3.time.format.utc.multi([
      ['%I %p', d => d.getUTCHours()],
      ['%b %d', d => d.getUTCDate() !== 1],
      ['%B', d => d.getUTCMonth()],
      ['%Y', () => true],
    ]);
  }

  getDateString(date) {
    return d3.time.format.utc('%d %B %Y')(new Date(date));
  }

  // We don't show tooltips by default
  addTooltips() {
    this.tooltip = d3.select(this.el)
      .append('div')
      .classed('tooltip', true)
      .style('position', 'fixed')
      .style('z-index', '10')
      .style('visibility', 'hidden');
  }

  onMouseMove() {
    if (!this.showTooltips) {
      return;
    }

    const top = (d3.event.pageY - 10);
    const left = (d3.event.pageX + 10);

    this.tooltip
      .style('top', `${top}px`)
      .style('left', `${left}px`);
  }

  onMouseOut() {
    if (!this.showTooltips) {
      return;
    }

    this.tooltip.style('visibility', 'hidden');
  }

  // Overwrite this function to apply your own removal logic
  unmount() {
    this.el.remove();
  }

  create() {
    // To be implemented by class extending BaseChart.
    // `data` is passed as an argument to this function.
  }

  update() {
    // To be implemented by class extending BaseChart.
    // `data` is passed as an argument to this function.
  }
}
