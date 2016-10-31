var xlsx = require('xlsx')
import fs from 'fs';
import cleanText from './cleanText';

const getData = (fileName, sheetIndex) => {

let workbook = xlsx.readFile(fileName);
  let cells = workbook.Sheets[workbook.SheetNames[sheetIndex]];
  let columns = new Set();

  // Remove duplicates and condense only top level
  // project vals
  Object.keys(cells).forEach((key) => {
    if (key.search(/\!/) === -1) {
      columns.add(key.split(/\d/i)[0])
    }
  })

  // Remove the "values" column from dataSet.
  columns.delete('A');

  var dataSet = {}

  // Assign each column to an entry on project
  // give that an array value
  for (let col of columns) {
    dataSet[col] = {export: true}
  }

  // Loop all the cells
  Object.keys(cells).forEach((key) => {
    let alpha = key.split(/\d/i)[0];
    let numeric = key.split(/[A-Z]{1,}/)[1]

    if (columns.has(alpha)) {

      let newKey = cleanText(cells[`A${numeric}`].w)

      dataSet[alpha][newKey] = (cells[key].v)
    }
  })

  return dataSet;
}


export default getData
