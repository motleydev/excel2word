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
      const company = getData(fileName[0], 3)

      console.table(projects)
      console.log(company)

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

      let invoices = projects.map((project, index) => {

          let result = new Object

          function dayHour (obj1, obj2) {
            return {t: obj1, chf: obj2}
          }

          result.ssb = dayHour()
          result.bsd = dayHour()
          result.dp = dayHour()
          result.drit = dayHour()
          result.project.number = ''
          result.project.name = ''
          result.project.sum = [
            result.ssb,
            result.bsd,
            result.dp].reduce((prev, curr) => {
              return prev.chf + curr.chf
            }, 0)

        return result
      })

      doc.setData({
        invoices: invoices
      });


      doc.render();

      var buf = doc.getZip().generate({type:"nodebuffer"});

      console.log(buf)

      fs.writeFileSync(fileName+'.docx', buf);

      // var out = fs.createWriteStream ( fileName+'.docx' );
      // docx.generate ( out );
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
