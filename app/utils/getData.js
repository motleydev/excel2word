import cleanText from './cleanText'

const xlsx = require('xlsx')

const timeStamp = new Date()

const cDate = {
  formatted: timeStamp.toISOString().substring(0, 10).toString(),
  year: timeStamp.getFullYear(),
  month: timeStamp.getMonth(),
  raw: timeStamp,
}

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
  columns.forEach((col) => {
    if (serialized) {
      dataSet[col] = { export: false }
    } else {
      dataSet[col] = {}
    }
  })

  return new Promise((resolve) => {
    // Loop all the cells
    Object.keys(cells).forEach((key) => {
      const alpha = key.split(/\d/i)[0]
      const numeric = key.split(/[A-Z]{1,}/)[1]

      if (columns.has(alpha)) {
        if (cells[`A${numeric}`] === 'UNDEFINED!' ||
          cells[`A${numeric}`] == null) {
          console.log(`errors with ${cells[`A${numeric}`]}`)
        } else {
          // Add Labels
          columnLabels.add(cleanText(cells[`A${numeric}`].w))

          const newKey = cleanText(cells[`A${numeric}`].w)
          console.log(cells[key])
          dataSet[alpha][newKey] = (cells[key].w)
        }
      }
    })

    const objKeys = Object.keys(dataSet)
    const nonSerialData = {}

    if (!serialized) {
      Object.keys(dataSet[objKeys[0]]).forEach((key) => {
        nonSerialData[key] = {
          export: true,
          value: dataSet[objKeys[0]][key],
        }
      })
    }

    const entries = serialized
      ? dataSet
      : nonSerialData

    const labels = Array.from(columnLabels).map(label => (
      {
        value: label,
        chosen: !serialized, //? false : true,
      }
    ))

    resolve({ entries, labels, cDate })
  })
}

export default getData
