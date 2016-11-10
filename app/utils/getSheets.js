import cleanText from './cleanText'

const xlsx = require('xlsx')

const getSheets = (fileName) => {
  const workbook = xlsx.readFile(fileName)
  const sheets = workbook.SheetNames

  const parsedSheets = sheets.map((sheet, index) => {
    return {
      name: cleanText(sheet),
      sheet: index,
      serialized: true,
      schema: {},
      orientation: 'vertical',
      selected: false,
      configOpen: false,
      data: {},
    }
  })

  return parsedSheets
}

export default getSheets
