// @flow
import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './Home.css'

import officegen from 'officegen'

import Button from '../ui/button/Button'

import getData from '../utils/getData'

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
      projects: {}
    }

    this.loadFile = this.loadFile.bind(this);
    this.saveFile = this.saveFile.bind(this);
    this.pickTemplate = this.pickTemplate.bind(this);
  }

  componentDidMount() {
    let today = new Date()
    this.setState({date: today})
  }

  loadFile() {
    // Open Book
    dialog.showOpenDialog((fileName) => {

      const projects = getData(fileName[0], 1)

      // Remove items without names
      for (let project in projects) {
        if (!projects[project].name) {
          delete projects[project]
        }
      }
      
      const company = getData(fileName[0], 3)
      
      console.log(projects)

      this.setState({projects: projects, company: company})

    })
  }

  pickTemplate() {
    // Open Book

    dialog.showOpenDialog((fileName) => {

    var content = fs
      .readFileSync(fileName[0], "binary");

      this.setState({template: content})

    })
  }

  saveFile() {
    dialog.showSaveDialog((fileName) => {

      var doc = new Docxtemplater(this.state.template);

      doc.setOptions({parser: angularParser});

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

  cancelProject(project) {
    let newProjectState = {...this.state.projects}

    newProjectState[project].export = !this.state.projects[project].export
    this.setState({projects: newProjectState})
  }

  render() {

    const {projects} = this.state;

    return (
      <div className={styles.container}>
        <div className={styles.controls}>
          <Button onClick={this.loadFile}>Import</Button>
          <Button onClick={this.pickTemplate}>Template</Button>
          <Button onClick={this.saveFile}>Export</Button>
          </div>
          {Object.keys(projects).length > 0 && <div className={styles.projectList}>
          <div>
            {
              Object.keys(projects).map((project, index) => {
                let pj = projects[project]
              return (
                <div key={index} onClick={(e) => {this.cancelProject(project, e)}}>
                  <p>{pj.name}{pj.export && <span>!</span>}</p>
                </div>)
            })}
              </div>
          </div>}
      </div>
    )
  }
}
