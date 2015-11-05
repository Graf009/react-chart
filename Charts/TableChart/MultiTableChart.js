/*
* @Author: Oleg Orlov
* @Date:   2015-09-29 17:46:19
*/

import d3 from 'd3';
import _ from 'lodash';

import TableChart from './TableChart';
import f from '_utils/prepareData';
import './TableChart.css';

export default class MultiTableChart extends TableChart {
  getTemplateColumns(data) {
    const columnTemplateDate = { head: 'Date', type: 'date', data: 'date' };
    const columnsTemplate = d3.keys(data).map(name => ({ head: name, type: 'numeric', data: name }));

    return [columnTemplateDate, ...columnsTemplate];
  }

  parseData(data) {
    return _(data)
      .map((d, name) => [...d].map(d => ({ [name]: d.value, date: d.date })))
      .reduce((previous, current) => _.merge(previous, current));
  }

  create(data) {
    const rows = this.parseData(data);
    const templateColumns = this.getTemplateColumns(data);
    const columns = this.getColumns(templateColumns);

    // create table
    this.table = d3.select(this.el)
      .append('table')
      .attr('class', 'tableChart mdl-data-table mdl-js-data-table');

    // create table header
    this.table.append('thead').append('tr')
      .selectAll('th')
      .data(columns).enter()
      .append('th')
      .attr('class', f('className'))
      .text(f('head'));

    // create table body
    this.table.append('tbody')
      .selectAll('tr')
      .data(rows).enter()
      .append('tr')
      .selectAll('td')
      .data(row =>
        columns.map(column => {
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
    const columns = this.getColumns(data);
    const rows = this.parseData(data);

    this.table.selectAll('th')
      .data(columns)
      .text(f('head'));

    this.table.selectAll('tbody tr')
      .data(rows)
      .selectAll('td')
      .data(row =>
        columns.map(column => {
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
