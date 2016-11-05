// @flow
import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './Home.css'

import officegen from 'officegen'

import Button from '../../ui/Button/Button'
import Table from '../Table/Table'
import Sheet from '../Sheet/Sheet'

import getData from '../../utils/getData'
import getSheets from '../../utils/getSheets'

var expressions = require('angular-expressions');

var angularParser = function(tag) {
    return {
        get: tag == '.' ? function(s){ return s;} : expressions.compile(tag)
    };
}

var Docxtemplater = require('docxtemplater');

const {dialog} = require('electron').remote

import fs from 'fs';


export default class Home extends Component {

  constructor(props) {
    super(props)

    this.state = {
      projects: {},
      company: {},
      activeTable: 0
    }

    this.loadFile = this.loadFile.bind(this);
    this.saveFile = this.saveFile.bind(this);
    this.pickTemplate = this.pickTemplate.bind(this);
    this.updateSheet = this.updateSheet.bind(this);
    this.processSheets = this.processSheets.bind(this);
  }

  componentDidMount() {
    let today = new Date()
    this.setState({date: today})
  }

  loadFile() {
    // Open Book
    dialog.showOpenDialog((fileName) => {

      // const projects = getData(fileName[0], 1)

      const sheets = getSheets(fileName[0])

      // Remove items without names
      // for (let project in projects) {
      //   if (!projects[project].name) {
      //     delete projects[project]
      //   }
      // }

      // const company = getData(fileName[0], 3)

      // this.setState({projects: projects, company: company})
      this.setState({sheets: sheets, file: fileName[0]})

    })
  }

  // pickSheet(index) {

  // }

  pickTemplate() {
    // Open Book

    dialog.showOpenDialog((fileName) => {

    var content = fs
      .readFileSync(fileName[0], "binary");

      this.setState({template: content})

    })
  }

  updateSheet (index, payload) {

    let newSheets = [...this.state.sheets]
    newSheets[index] = payload

    this.setState({sheets: newSheets})

  }

  saveFile() {

    // let schema = {
    //         sbb: {
    //           t:'strategie-senior-beratung-t',
    //           chf: 'strategie-senior-beratung-chf'
    //         },

    //         bsd: {
    //           t: 'beratung-senior-design-text-t',
    //           chf: 'beratung-senior-design-chf'
    //         },

    //         pd: {
    //           t: 'projektmanagement-design-t',
    //           chf: 'projektmanagement-design-chf'
    //         },

    //         drit: {
    //           chf: 'rngsumme-externe-inkl-mwst-chf'
    //         },

    //         project: {
    //           number: 'arbeitspaket',
    //           name: 'name'
    //         }

    //       }


  //    if (schema) {


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



    dialog.showSaveDialog((fileName) => {

      var doc = new Docxtemplater(this.state.template);

      doc.setOptions({parser: angularParser});

      // Loop all sheets
        // If schema present, process data array by schema
        // If none serialized return first object onto master data object
        // Add sheet by named key onto master data object
      // set Data

      let sheets = {...this.state.parsedSheets}
      let projects = {...this.state.projects}

      let invoices = []

      for (let entry in this.state.projects) {

        let project = this.state.projects[entry]

          let result = new Object({project: {}})

          function dayHour (obj1, obj2) {

            let a = obj1 ? obj1 : 0
            let b = obj2 ? obj2 : 0
            return {
              t: a,
              chf: b
            }
          }


          result.ssb = dayHour(
            project['strategie-senior-beratung-t'],
            project['strategie-senior-beratung-chf'])
          result.bsd = dayHour(
            project['beratung-senior-design-text-t'],
            project['beratung-senior-design-chf'])
          result.pd = dayHour(
            project['projektmanagement-design-t'],
            project['projektmanagement-design-chf'])
          result.drit = dayHour(0,
            project['rngsumme-externe-inkl-mwst-chf'])
          result.project.number = project.arbeitspaket
          result.project.name = project.name
          result.project.sum = [
            result.ssb,
            result.bsd,
            result.pd,
            result.drit].reduce((prev, curr) => {
              return prev + (curr ? curr.chf : 0)
            }, 0)

        invoices.push(result)
      }
      let {company, name, department, address, zip, city, head, short} =
        this.state.company['B']

      doc.setData({
        company: company,
        name: name,
        department: department,
        address: address,
        zip: zip,
        city: city,
        head: head,
        short: short,
        invoices: invoices
      });


      doc.render();

      var buf = doc.getZip().generate({type:"nodebuffer"});

      fs.writeFileSync(fileName+'.docx', buf);

    })
  }

  processSheets () {


    // Set up blank Array
    let selectedSheets = []

    // Get only my selected sheets
    this.state.sheets.map((sheet) => {
      if (sheet.selected) {
        selectedSheets.push(sheet)
      }
    })

    // Process those sheets async
    let finalResult = selectedSheets.map((worksheet, index) => {

      let opts = {
        serialized: worksheet.serialized
      }

       getData(this.state.file, worksheet.sheet, opts).then(
        result => worksheet.data = result
        ).catch((err) => worksheet.data =  err)
    })

    this.setState({parsedSheets: finalResult})
  }

  // cancelProject(project) {
  //   let newProjectState = {...this.state.projects}

  //   newProjectState[project].export = !this.state.projects[project].export
  //   this.setState({projects: newProjectState})
  // }

  componentDidUpdate() {
    console.count("updated")
  }

  render() {

    const {projects} = this.state

    return (
      <div className={styles.container}>

        <div className={styles.controls}>
        <div>

          <p>Step One</p>
            <Button onClick={this.loadFile}>Import</Button>


          <p>Step Two</p>
            <Button onClick={this.pickTemplate}>Template</Button>

          </div>
        </div>

        <div className={styles.canvas}>

        {this.state.parsedSheets &&
          <div>
          <div>

          {this.state.parsedSheets.map( (sheet, index) => {
            return <div key={index}>{sheet.name}</div>
          } )}

          </div>
            <Table projects={this.state.parsedSheets[this.state.activeTable]} />
          </div>}

        {(this.state.sheets && !this.state.parsedSheets) &&
          <div className={styles.sheets}>
            {this.state.sheets.map((sheet, index) => {
              return <Sheet key={index} index={index} sheet={sheet}
              updateSheet={this.updateSheet}/>
            })}
            <div className={styles.doneButton}>
            <Button onClick={this.processSheets}>Done!</Button></div>
          </div>}

        </div>

        <div className={styles.footer}>
          <Button onClick={this.saveFile}>Export</Button>
        </div>

      </div>
    )
  }
}
