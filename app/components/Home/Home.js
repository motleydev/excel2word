/**
 *
 * Home.js
 * The main entrypoint for the app
 *
 */

import React, { Component } from 'react';
// Libs
import officegen from 'officegen'
const expressions = require('angular-expressions');
const Docxtemplater = require('docxtemplater');
import fs from 'fs';
// Utils
import getData from '../../utils/getData'
import getSheets from '../../utils/getSheets'
const {dialog} = require('electron').remote
// Style
import styles from './Home.css'
// Components
import Button from '../../ui/Button/Button'
import Table from '../Table/Table'
import Sheet from '../Sheet/Sheet'

export default class Home extends Component {

  constructor(props) {
    super(props)

    this.state = {
      projects: {},
      company: {},
      activeTable: 0,
      parsedSheets: []
    }

    this.loadFile = this.loadFile.bind(this);
    this.saveFile = this.saveFile.bind(this);
    this.pickTemplate = this.pickTemplate.bind(this);
    this.updateSheet = this.updateSheet.bind(this);
    this.processSheets = this.processSheets.bind(this);
    this.toggleLabel = this.toggleLabel.bind(this);
    this.cancelProject = this.cancelProject.bind(this);
  }

  componentDidMount() {
    let today = new Date()
    this.setState({date: today})
  }

  loadFile() {
    // Open Book
    dialog.showOpenDialog((fileName) => {

      // const projects = getData(fileName[0], 1)
      let sheets = []
      sheets = getSheets(fileName[0])

      this.setState({
        sheets: sheets,
        file: fileName[0],
        parsedSheets: [],
        company: {},
        projects: {}
      })

    })
  }

  pickTemplate() {
    // Open Book

    dialog.showOpenDialog((fileName) => {

    var content = fs
      .readFileSync(fileName[0], 'binary');

      this.setState({template: content})

    })
  }

  updateSheet (index, payload) {

    let newSheets = [...this.state.sheets]
    newSheets[index] = payload

    this.setState({sheets: newSheets})

  }

  saveFile() {

    let angularParser = (tag) => {
    return {
        get: tag == '.' ? function(s){ return s;} : expressions.compile(tag)
    };
}

    let schemaMap = (dest, source) => {

      Object.keys(dest).map((key)=> {

        if (typeof dest[key] === 'object') {
          schemaMap(dest[key], source)
        } else {
          dest[key] = source[dest[key]]
        }
      })
      return dest

    }

    let clone = (obj) => {
      if(obj == null || typeof(obj) != 'object')
          return obj;

      var temp = obj.constructor();

      for(var key in obj)
          temp[key] = clone(obj[key]);
      return temp;
    }

    let sheets = this.state.parsedSheets.filter((sheet) => {
      return !!sheet.data.entries
    })

    let totalEntries = {}

    sheets.forEach((sheet) => {

      if (!sheet.serialized) {

        let result = {}
        let entries = sheet.data.entries

        for (let entry in entries) {

          let dataEntry = entries[entry]

          if (dataEntry.export) {
            result[entry] = dataEntry.value
          }

        }

        totalEntries[sheet.name] = result

      } else {


        let result = []
        let entries = sheet.data.entries

        for (let entry in entries) {

          let dataEntry = entries[entry]

          if (dataEntry.export) {


              // Get a copy of the schema object

              if (Object.keys(sheet.schema).length > 0) {

                let schemaObj = clone(sheet.schema)
                let parsedObj = schemaMap(schemaObj, dataEntry)
                result.push(parsedObj)

              } else {
                result.push(dataEntry)
              }

          }

        }

        totalEntries[sheet.name] = result

      }

    })

    dialog.showSaveDialog((fileName) => {

      var doc = new Docxtemplater(this.state.template);

      doc.setOptions({parser: angularParser});

      console.log(totalEntries)

      doc.setData(totalEntries)
      doc.render();

      var buf = doc.getZip().generate({type:'nodebuffer'});

      fs.writeFileSync(fileName+'.docx', buf);

    })

  }

  processSheets () {

    let _this = this
    // Set up blank Array
    let selectedSheets =
      this.state.sheets.filter( sheet => sheet.selected)

      selectedSheets.forEach((worksheet) => {

        let opts = {
          serialized: worksheet.serialized
        }

        getData(this.state.file, worksheet.sheet, opts).then(
          result => {
            worksheet.data = result
            this.setState({parsedSheets: [worksheet, ...this.state.parsedSheets]})
          }
        ).catch((err) => {
          worksheet.data =  err
          this.setState({parsedSheets: [worksheet, ...this.state.parsedSheets]})
        })

      })

  }

  toggleLabel(index) {

    let parsedSheets = [...this.state.parsedSheets]

    parsedSheets[this.state.activeTable].data.labels[index].chosen =
    !this.state.parsedSheets[this.state.activeTable].data.labels[index].chosen

    this.setState({parsedSheets: parsedSheets})

  }

  cancelProject(project) {
    let newProjectState = {...this.state.parsedSheets[this.state.activeTable].data.entries}

    newProjectState[project].export =
      !this.state.parsedSheets[this.state.activeTable].data.entries[project].export
    this.setState({projects: newProjectState})
  }

  render() {

    const {projects} = this.state

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
            <img src='../reference/wolf.png'/>
          </div>}

        {this.state.parsedSheets.length > 0 &&

        <div>

          <div className={styles.sheetNames}>
          {this.state.parsedSheets.map( (sheet, index) => {

            let style = [
              styles.sheetName,
              index === this.state.activeTable ? styles.selected : ''
            ].join(' ')

            return (
              <div
                key={index}
                onClick={()=>this.setState({activeTable: index}) }
                className={style}>
                {sheet.name}
              </div>)
          } )}
          </div>

            <Table
              projects={this.state.parsedSheets[this.state.activeTable]}
              toggleLabel={this.toggleLabel}
              cancelProject={this.cancelProject}
            />
          </div>}

        {(this.state.sheets && this.state.parsedSheets.length < 1) &&
          <div className={styles.sheets}>
            {this.state.sheets.map((sheet, index) => {
              return <Sheet key={index} index={index} sheet={sheet}
              updateSheet={this.updateSheet}/>
            })}
            <div className={styles.doneButton}>
            <Button onClick={this.processSheets}>Done!</Button></div>
          </div>}

        </div>

        <div className={[styles.controls, styles.footer].join(' ')}>
        <div>
          <p>Step Two</p>
            <Button onClick={this.pickTemplate}>Pick a Template</Button>
            <p>Step Three</p>
          <Button onClick={this.saveFile}>Export Document</Button>
          </div>
        </div>

      </div>
    )
  }
}
