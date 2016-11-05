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

    this.state = {
      columns: [],
      selectedColumns: []

    }
  }

  componentDidMount() {
    // if (this.props.projects.data && this.props.projects.data.labels) {

    //   let labels = this.props.projects.data.labels.map((label) => {
    //     return {value: label, chose: false}
    //   })

    //   console.log(labels)

    //   this.setState({columns: labels})

    // }
  }

  render() {
    console.log(this.props)

    let {projects} = this.props
    let {entries, labels} = projects.data

    return (
        <div className={styles.projectList}>

        { labels &&
          <div className={styles.labels}>
            {labels.map((column, index) => {
              return <div key={index}>{column}</div>
            })}
          </div>}


        <div className={styles.table}>

          {this.state.selectedColumns.length > 0 && <div className={styles.tableHeader}>
            <span style={{flex: '1 1 5%'}}>Export</span>
            <span style={{flex: '2 1 20%'}}>Name</span>
            <span style={{flex: '1 1 5%'}}>Project</span>
            <span style={{flex: '2 1 10%'}}>Total</span>
          </div>}

            {this.state.selectedColumns.length > 0 &&
              Object.keys(this.props.projects).map((project, index) => {
                let pj = this.props.projects[project]
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
                    <span>{(pj['total-cost']||0).toFixed(2)}</span>
                  </span>
                </div>)
            })}
              </div>
        </div>
    )
  }
}
