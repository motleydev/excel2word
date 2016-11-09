var xlsx = require('xlsx')
import fs from 'fs';
import cleanText from './cleanText';



const getData = (fileName, sheetIndex, opts) => {

  let {serialized, schema} = opts

  const dataSet = {}

  let workbook = xlsx.readFile(fileName)
  let cells = workbook.Sheets[workbook.SheetNames[sheetIndex]]
  let columns = new Set();

  // Remove duplicates and condense only top level
  // project vals
  Object.keys(cells).forEach((key) => {
    if (key.search(/\!/) === -1) {
      columns.add(key.split(/\d/i)[0])
    }
  })



  let columnLabels = new Set();


  // Remove the "values" column from dataSet.
  columns.delete('A');

  // Assign each column to an entry on project
  // give that an array value


  for (let col of columns) {
    if (serialized) {
      dataSet[col] = {export: true}
    } else {
      dataSet[col] = {}
    }
  }


return new Promise((resolve, reject) => {

  // Loop all the cells
  Object.keys(cells).forEach((key) => {
    let alpha = key.split(/\d/i)[0];
    let numeric = key.split(/[A-Z]{1,}/)[1]

    if (columns.has(alpha)) {

      if( cells[`A${numeric}`] == 'undefined' ||
          cells[`A${numeric}`] == null ) {

        reject({
          message: 'This worksheet cannot be parsed',
          error: true
        })

      } else {

        // Add Labels
        columnLabels.add(cleanText(cells[`A${numeric}`].w))

        let newKey = cleanText(cells[`A${numeric}`].w)
        dataSet[alpha][newKey] = (cells[key].v)

      }

    }
  })


  let objKeys = Object.keys(dataSet)
  let nonSerialData = new Object;

  if (!serialized) {
    for (let key in dataSet[objKeys[0]]) {
      nonSerialData[key] = {
        export: true,
        value: dataSet[objKeys[0]][key]
      }
    }
  }

  let result = serialized
    ? dataSet
    : nonSerialData

  let labels = Array.from(columnLabels).map((label, index) => {
    return {
      value: label,
      chosen: serialized ? false : true
    }
  })

  resolve({entries: result, labels: labels});

 })

}


export default getData
