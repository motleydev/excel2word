import cleanText from './cleanText'

const xlsx = require('xlsx')

const getData = (fileName, sheetIndex, opts) => {
  const { serialized } = opts

  const dataSet = {}

  const workbook = xlsx.readFile(fileName)
  const cells = workbook.Sheets[workbook.SheetNames[sheetIndex]]
  const columns = new Set()

  // Remove duplicates and condense only top level
  // project vals
  Object.keys(cells).forEach((key) => {
    if (key.search(/!/) === -1) {
      columns.add(key.split(/\d/i)[0])
    }
  })

  const columnLabels = new Set()

  // Remove the "values" column from dataSet.
  columns.delete('A')

  // Assign each column to an entry on project
  // give that an array value

  for (let col of columns) {
    if (serialized) {
      dataSet[col] = { export: true }
    } else {
      dataSet[col] = {}
    }
  }

  return new Promise((resolve, reject) => {
    // Loop all the cells
    Object.keys(cells).forEach((key) => {
      const alpha = key.split(/\d/i)[0]
      const numeric = key.split(/[A-Z]{1,}/)[1]

      if (columns.has(alpha)) {
        if (cells[`A${numeric}`] === 'undefined' ||
          cells[`A${numeric}`] == null) {
          reject({
            message: 'This worksheet cannot be parsed',
            error: true,
          })
        } else {
          // Add Labels
          columnLabels.add(cleanText(cells[`A${numeric}`].w))

          const newKey = cleanText(cells[`A${numeric}`].w)
          dataSet[alpha][newKey] = (cells[key].v)
        }
      }
    })

    const objKeys = Object.keys(dataSet)
    const nonSerialData = {}

    if (!serialized) {
      for (let key in dataSet[objKeys[0]]) {
        nonSerialData[key] = {
          export: true,
          value: dataSet[objKeys[0]][key],
        }
      }
    }

    const result = serialized
      ? dataSet
      : nonSerialData

    const labels = Array.from(columnLabels).map((label) => {
      return {
        value: label,
        chosen: serialized ? false : true,
      }
    })

    resolve({ result, labels })
  })
}

export default getData
