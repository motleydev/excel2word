// @flow
import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './Home.css'

import officegen from 'officegen'

import Button from '../ui/button/Button'

var expressions = require('angular-expressions');

var angularParser = function(tag) {
    return {
        get: tag == '.' ? function(s){ return s;} : expressions.compile(tag)
    };
}

var Docxtemplater = require('docxtemplater');

const {dialog} = require('electron').remote

import fs from 'fs';
var xlsx = require('xlsx')

var docx = officegen ( 'docx' );
var pObj = docx.createP ();

function cleanText(value){
  value = value.toLowerCase();
  value = value.replace(/u00E4/g, 'ae');
  value = value.replace(/u00F6/g, 'oe');
  value = value.replace(/u00FC/g, 'ue');
  value = value.replace(/ß/g, 'ss');
  value = value.replace(/ /g, '-');
  value = value.replace(/\./g, '');
  value = value.replace(/,/g, '');
  value = value.replace(/\(/g, '');
  value = value.replace(/\)/g, '');
  return value;
}

pObj.addText ( 'Simple' );
pObj.addText ( ' with color', { color: '000088' } );
pObj.addText ( ' and back color.', { color: '00ffff', back: '000088' } );



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

  loadFile() {
    // Open Book
    dialog.showOpenDialog((fileName) => {
       
      var workbook = xlsx.readFile(fileName[0]);
      var cells = workbook.Sheets[workbook.SheetNames[0]];
      var columns = new Set();


      // Remove duplicates and condense only top level
      // project vals
      Object.keys(cells).forEach((key) => {
        if (key.search(/\!/) === -1) {
          columns.add(key.split(/\d/i)[0])
        }
      })

      // Remove the "values" column from projects.
      columns.delete('A');
      
      var projects = {}

      // Assign each column to an entry on project
      // give that an array value
      for (let col of columns) {
        projects[col] = {export: true}
      }

      // Loop all the cells
      Object.keys(cells).forEach((key) => {
        let alpha = key.split(/\d/i)[0];
        let numeric = key.split(/[A-Z]{1,}/)[1]
        
        if (columns.has(alpha)) {

          let newKey = cleanText(cells[`A${numeric}`].w)

          projects[alpha][newKey] = (cells[key].v)
        }
      })

      this.setState({projects: projects})

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

      doc.setData({
        invoices: [
        {
          date: new Date(),
          company: "Basler Kantonalbank",
          name: "Mathias von Wartburg",
          department: "Marketing",
          address: "Aeschenvorstadt 41",
          zip: 4051,
          city: "Basel",
          ssb: {
            t: ,
            chf:
          },
          bsd: {
            t: ,
            chf:
          },
          dp: {
            t: ,
            chf:
          },
          drit: ,
          sum: 0,

        }],
        project: {
          name: "Bildwelt"
        }
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
