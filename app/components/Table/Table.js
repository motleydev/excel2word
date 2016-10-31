// @flow
import React, { Component } from 'react';
import styles from './Table.css'

var expressions = require('angular-expressions');

var angularParser = function(tag) {
    return {
        get: tag == '.' ? function(s){ return s;} : expressions.compile(tag)
    };
}

export default class Table extends Component {

  constructor(props) {
    super(props)
  }

  render() {

    return (
        <div className={styles.projectList}>
          <div className={styles.table}>

          <div className={styles.tableHeader}>
            <span style={{flex: '1 1 5%'}}>Export</span>
            <span style={{flex: '2 1 20%'}}>Name</span>
            <span style={{flex: '1 1 5%'}}>Project</span>
            <span style={{flex: '2 1 10%'}}>Total</span>
          </div>
            {
              Object.keys(this.props.projects).map((project, index) => {
                let pj = projects[project]
              return (
                <div
                  className={styles.tableData}
                  key={index}
                  onClick={(e) => {this.cancelProject(project, e)}}>
                  <span style={{flex: '1 1 5%'}}>{pj.export && <span>!</span>}</span>
                  <span style={{flex: '2 1 20%'}}>
                    <span>{pj.name}</span>
                  </span>
                  <span style={{flex: '1 1 5%'}}>
                    <span>{pj['arbeitspaket']}</span>
                  </span>
                  <span style={{flex: '2 1 5%'}}>
                    <span>{pj['total-cost'].toFixed(2)}</span>
                  </span>
                </div>)
            })}
              </div>
        </div>
    )
  }
}
