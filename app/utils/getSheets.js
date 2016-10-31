var xlsx = require('xlsx')
import fs from 'fs'
import cleanText from './cleanText'



const getSheets = (fileName) => {

  let workbook = xlsx.readFile(fileName);
  let sheets = workbook.SheetNames;

  let parsedSheets = sheets.map((sheet, index) => {
    return {
      name: cleanText(sheet),
      sheet: index,
      serialized: true,
      schema: {},
      orientation: 'vertical',
      selected: false,
      configOpen: false,
      data: {}
    }
  })

  return parsedSheets;
}


export default getSheets
