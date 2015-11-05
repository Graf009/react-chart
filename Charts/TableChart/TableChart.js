/*
* @Author: Oleg Orlov
* @Date:   2015-09-08 12:29:19
*/

import d3 from 'd3';
import classNames from 'classnames';

import BaseChart from '../BaseChart';
import f from '_utils/prepareData';
import './TableChart.css';

export default class TableChart extends BaseChart {
  defaultColumns = [
    { head: 'Date', type: 'date', data: 'date' },
    { head: 'Value', type: 'numeric', data: 'value' },
  ];

  getColumns(template) {
    return template.map(column => {
      let className = '';
      if (column.type !== 'numeric') className = 'mdl-data-table__cell--non-numeric';
      let html = f(column.data);
      if (column.type === 'date') html = f(html, this.getDateString);

      return {
        head: column.head,
        className,
        html,
      };
    });
  }

  create(data) {
    const templateColumns = this.props.columns || this.defaultColumns;
    this.columns = this.getColumns(templateColumns);

    // create table
    this.table = d3.select(this.el)
      .append('table')
      .attr('class', classNames('tableChart mdl-data-table mdl-js-data-table', {'mdl-data-table--selectable': this.props.selecTable}));

    // create table header
    this.table.append('thead').append('tr')
      .selectAll('th')
      .data(this.columns).enter()
      .append('th')
      .attr('class', f('className'))
      .text(f('head'));

    // create table body
    this.table.append('tbody')
      .selectAll('tr')
      .data(data).enter()
      .append('tr')
      .selectAll('td')
      .data(row =>
        this.columns.map(column => {
          // compute cell values for this specific row
          let cell = {};
          d3.keys(column).forEach(key => {
            cell[key] = typeof column[key] === 'function' ? column[key](row) : column[key];
          });
          return cell;
        })
      ).enter()
      .append('td')
      .html(f('html'))
      .attr('class', f('className'));
  }

  update(data) {
    this.table.selectAll('tbody tr')
      .data(data)
      .selectAll('td')
      .data(row =>
        this.columns.map(column => {
          // compute cell values for this specific row
          let cell = {};
          d3.keys(column).forEach(key => {
            cell[key] = typeof column[key] === 'function' ? column[key](row) : column[key];
          });
          return cell;
        })
      ).html(f('html'));
  }
}
