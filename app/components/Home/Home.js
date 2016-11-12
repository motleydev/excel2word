/**
 *
 * Home.js
 * The main entrypoint for the app
 *
 */

import React, { Component } from 'react'
// Libs
import fs from 'fs'

// Style
import styles from './Home.css'
// Components
import Button from '../../ui/Button/Button'
import Table from '../Table/Table'
import Sheet from '../Sheet/Sheet'

// Utils
import getData from '../../utils/getData'
import getSheets from '../../utils/getSheets'

const { dialog } = require('electron').remote
const expressions = require('angular-expressions')
const Docxtemplater = require('docxtemplater')

export default class Home extends Component {

  constructor(props) {
    super(props)

    this.state = {
      projects: {},
      company: {},
      activeTable: 0,
      parsedSheets: [],
    }

    this.loadFile = this.loadFile.bind(this)
    this.saveFile = this.saveFile.bind(this)
    this.pickTemplate = this.pickTemplate.bind(this)
    this.updateSheet = this.updateSheet.bind(this)
    this.processSheets = this.processSheets.bind(this)
    this.toggleLabel = this.toggleLabel.bind(this)
    this.cancelProject = this.cancelProject.bind(this)
  }

  loadFile() {
    // Open Book
    dialog.showOpenDialog((fileName) => {
      // const projects = getData(fileName[0], 1)
      let sheets = []
      sheets = getSheets(fileName[0])

      this.setState({
        sheets,
        file: fileName[0],
        parsedSheets: [],
        company: {},
        projects: {},
      })
    })
  }

  pickTemplate() {
    // Open Book
    dialog.showOpenDialog((fileName) => {
      const content = fs
        .readFileSync(fileName[0], 'binary')

      this.setState({ template: content })
    })
  }

  updateSheet(index, payload) {
    const newSheets = [...this.state.sheets]
    newSheets[index] = payload

    this.setState({ sheets: newSheets })
  }

  saveFile() {
    const angularParser = tag => (
      { get: tag === '.' ? s => s : expressions.compile(tag) }
    )

    const schemaMap = (dest, source) => {
      const newDest = dest
      Object.keys(newDest).forEach((key) => {
        if (typeof newDest[key] === 'object') {
          schemaMap(newDest[key], source)
        } else {
          newDest[key] = source[dest[key]]
        }
      })
      return newDest
    }

    const clone = (obj) => {
      if (obj == null || typeof obj !== 'object') {
        return obj
      }

      const temp = obj.constructor()

      Object.keys(obj).forEach((key) => {
        temp[key] = clone(obj[key])
        return temp
      })
    }

    const sheets = this.state.parsedSheets.filter(
      sheet => !!sheet.data.entries
    )

    const totalEntries = {}

    sheets.forEach((sheet) => {
      if (!sheet.serialized) {
        const result = { cDate: sheet.data.cDate }
        const entries = sheet.data.entries

        Object.keys(entries).forEach((entry) => {
          const dataEntry = entries[entry]
          if (dataEntry.export) {
            result[entry] = dataEntry.value
          }
        })
        totalEntries[sheet.name] = result
      } else {
        const result = []
        const entries = sheet.data.entries

        Object.keys(entries).forEach((entry) => {
          const dataEntry = entries[entry]

          if (dataEntry.export) {
            // Get a copy of the schema object
            if (Object.keys(sheet.schema).length > 0) {
              const schemaObj = clone(sheet.schema)
              const parsedObj = schemaMap(schemaObj, dataEntry)
              parsedObj.cDate = sheet.data.cDate
              result.push(parsedObj)
            } else {
              result.push(dataEntry)
            }
          }
        })
        totalEntries[sheet.name] = result
      }
    })

    dialog.showSaveDialog((fileName) => {
      const doc = new Docxtemplater(this.state.template)

      doc.setOptions({ parser: angularParser })
      doc.setData(totalEntries)
      doc.render()

      const buf = doc.getZip().generate({ type: 'nodebuffer' })

      fs.writeFileSync(`${fileName}.docx`, buf)
    })
  }

  processSheets() {
    // Set up blank Array
    const selectedSheets =
      this.state.sheets.filter(sheet => sheet.selected)

    selectedSheets.forEach((worksheet) => {
      const newWorksheet = worksheet
      const opts = {
        serialized: worksheet.serialized,
      }

      getData(this.state.file, worksheet.sheet, opts).then(
        (result) => {
          newWorksheet.data = result
          this.setState({ parsedSheets: [
            newWorksheet,
            ...this.state.parsedSheets,
          ] })
          return null
        }
      ).catch((err) => {
        newWorksheet.data = err
        this.setState({ parsedSheets: [
          newWorksheet,
          ...this.state.parsedSheets,
        ] })
      })
    })
  }

  toggleLabel(index) {
    const parsedSheets = [...this.state.parsedSheets]

    parsedSheets[this.state.activeTable].data.labels[index].chosen =
    !this.state.parsedSheets[this.state.activeTable].data.labels[index].chosen

    this.setState({ parsedSheets })
  }

  cancelProject(project) {
    const newProjectState = { ...this.state.parsedSheets[this.state.activeTable].data.entries }

    newProjectState[project].export =
      !this.state.parsedSheets[this.state.activeTable].data.entries[project].export
    this.setState({ projects: newProjectState })
  }

  render() {
    return (
      <div className={styles.container}>

        <div className={[styles.controls, styles.header].join(' ')}>

          <div>
            <p>Step One</p>
            <Button onClick={this.loadFile}>Import Excel File</Button>
          </div>

        </div>
        <div className={styles.canvas}>

          {!this.state.sheets &&
            <div className={styles.wolf}>
              <img src="../reference/wolf.png" alt="The head of a wolf" />
            </div>}

          {this.state.parsedSheets.length > 0 &&
          <div>
            <div className={styles.sheetNames}>
              {this.state.parsedSheets.map((sheet, index) => {
                const style = [
                  styles.sheetName,
                  index === this.state.activeTable ? styles.selected : '',
                ].join(' ')

                return (
                  <a
                    href=""
                    key={index}
                    onClick={(e) => {
                      e.preventDefault()
                      this.setState({ activeTable: index })
                    }}
                    className={style}
                  >
                    {sheet.name}
                  </a>)
              })}
            </div>

            <Table
              projects={this.state.parsedSheets[this.state.activeTable]}
              toggleLabel={this.toggleLabel}
              cancelProject={this.cancelProject}
            />
          </div>}

          {(this.state.sheets && this.state.parsedSheets.length < 1) &&
            <div className={styles.sheets}>
              {this.state.sheets.map((sheet, index) => (
                <Sheet
                  key={index}
                  index={index}
                  sheet={sheet}
                  updateSheet={this.updateSheet}
                />)
              )}
              <div className={styles.doneButton}>
                <Button onClick={this.processSheets}>Done!</Button>
              </div>
            </div>}

        </div>

        <div className={[styles.controls, styles.footer].join(' ')}>
          <div>
            <p>Step Two</p>
            <Button
              disabled={!(this.state.parsedSheets.length > 0)}
              onClick={this.pickTemplate}
            >Pick a Template
            </Button>
            <p>Step Three</p>
            <Button
              disabled={!this.state.template}
              onClick={this.saveFile}
            >Export Document
            </Button>
          </div>
        </div>
      </div>
    )
  }
}
