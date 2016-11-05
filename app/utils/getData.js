var xlsx = require('xlsx')
import fs from 'fs';
import cleanText from './cleanText';


function clone(obj){
   if(obj == null || typeof(obj) != 'object')
      return obj;

   var temp = obj.constructor();

   for(var key in obj)
       temp[key] = clone(obj[key]);
   return temp;
}

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
    dataSet[col] = {export: true}
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
          message: 'This message cannot be parsed',
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


  // if (schema) {


  //   function schemaMap(dest, source) {

  //     Object.keys(dest).map((key)=> {

  //       if (typeof dest[key] === 'object') {
  //         schemaMap(dest[key], source)
  //       } else {
  //         dest[key] = source[dest[key]]
  //       }
  //     })
  //     return dest

  //   }



  //   // Loop each project
  //   for (let dataEntry in dataSet) {

  //     // Get a copy of the schema object
  //     let schemaObj = clone(schema)
  //     let project = dataSet[dataEntry]
  //     let parsedObj = schemaMap(schemaObj, project)

  //     dataSet[dataEntry] = parsedObj

  //   }

  // }

  let objKeys = Object.keys(dataSet)

  let result = serialized
    ? dataSet
    : dataSet[objKeys[0]]

  resolve({entries: result, labels: Array.from(columnLabels)});

 })

}


export default getData
