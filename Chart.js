 /*
 * @Author: Oleg Orlov
 * @Date:   2015-09-01 14:47:19
 */

import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';

import { BarChart, LineChart, TableChart, MultiLineChart, MultiTableChart } from './Charts';

export default class Chart extends Component {
  static propTypes = {
    data: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object,
    ]).isRequired,
    type: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);

    this.chartToClassMappings = {
      bar: BarChart,
      line: LineChart,
      multiLine: MultiLineChart,
      table: TableChart,
      multiTable: MultiTableChart,
    };
  }

  componentDidMount() {
    if (Object.keys(this.props.data).length === 0) {
      return;
    }

    const el = findDOMNode(this);
    const Char = this.chartToClassMappings[this.props.type];

    this.chart = new Char(el, this.props);
    this.chart.create(this.props.data);
  }

  componentDidUpdate() {
    this.chart.update(this.props.data);
  }

  componentWillUnmount() {
    this.chart.unmount();
  }

  render() {
    return <div className="chart"></div>;
  }
}
