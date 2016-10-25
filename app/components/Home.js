// @flow
import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './Home.css'

import officegen from 'officegen'


const {dialog} = require('electron').remote

import fs from 'fs';
var xlsx = require('xlsx')

var docx = officegen ( 'docx' );
var pObj = docx.createP ();

pObj.addText ( 'Simple' );
pObj.addText ( ' with color', { color: '000088' } );
pObj.addText ( ' and back color.', { color: '00ffff', back: '000088' } );



export default class Home extends Component {

  constructor(props) {
    super(props)

    this.loadFile = this.loadFile.bind(this);
    this.saveFile = this.saveFile.bind(this);
  }

  loadFile() {
    dialog.showOpenDialog((fileName) => {
       
      var workbook = xlsx.readFile(fileName[0]);
      var cells = workbook.Sheets[workbook.SheetNames[0]];
      var columns = new Set();

      Object.keys(cells).forEach((key) => {
        if (key.search(/\!/) === -1) {
          columns.add(key.split(/\d/i)[0])
        }
      })

      columns.delete('A');
      
      var projects = {}

      for (let col of columns) {
        projects[col] = []
      }

      Object.keys(cells).forEach((key) => {
        let alpha = key.split(/\d/i)[0];
        
        if (columns.has(alpha)) {
          projects[alpha].push(cells[key])
        }
      })

      console.log(projects)

    })
  }

  saveFile() {
    dialog.showSaveDialog((fileName) => {

      var out = fs.createWriteStream ( fileName+'.docx' );
      docx.generate ( out );
    })
  }

  render() {



    return (
      <div>
        <div className={styles.container}>
        <div onClick={this.loadFile} style={{background:"red", width: 50, height: 50}} />
        <div onClick={this.saveFile} style={{background:"green", width: 50, height: 50}} />

        </div>
      </div>
    );
  }
}
