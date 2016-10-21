// @flow
import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './Home.css'


const {dialog} = require('electron').remote

import fs from 'fs';
var xlsx = require('xlsx')

export default class Home extends Component {

  constructor(props) {
    super(props)

    this.saveFile = this.saveFile.bind(this);
  }

  saveFile() {
    dialog.showOpenDialog((fileName) => {
       
      var workbook = xlsx.readFile(fileName[0]);

      console.log(workbook.Sheets[workbook.SheetNames[0]])

    })
  }

  render() {



    return (
      <div>
        <div className={styles.container}>
        <div onClick={this.saveFile} style={{background:"red", width: 50, height: 50}} />

        </div>
      </div>
    );
  }
}
