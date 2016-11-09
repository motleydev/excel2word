// @flow
import React, { Component } from 'react';
import styles from './Table.css'
import {
  IoAndroidCheckboxOutlineBlank,
  IoAndroidCheckboxOutline,
  IoGearA
} from 'react-icons/io'

import Button from '../../ui/Button/Button'

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
      columnEditorOpen: true
    }
  }

  render() {
    let {projects} = this.props
    let {serialized} = projects
    let {entries, labels, message, error} = projects.data
    let editor = this.state.columnEditorOpen

    let chosen = labels ? labels.filter((label) => label.chosen) : []
    let width = `${((100 / (chosen.length + 1)) * 100)/100}%`

    return (
        <div className={styles.projectList}>

        <div className={styles.table}>

        { error &&
          <div className={styles.error}>
            <div><h2>{message}</h2></div>
          </div>}

          {(editor && !error) &&

            <div className={styles.editor}>
              { labels &&
              <div className={styles.labels}>
                {labels.map((label, index) => {

                let style = [
                styles.base,
                label.chosen ? styles.chosen : ''
                ].join(' ')

                return (
                  <div
                    className={style}
                    key={index}
                    onClick={() => this.props.toggleLabel(index)}
                  >{label.value}</div>)

              })}
          </div>}

          <div className={styles.message}>
            <p>Please choose some column headings above</p>
          </div>
          <div>
            <Button onClick={() => {this.setState({columnEditorOpen: !editor})}}>Done</Button>
          </div>

          </div>}

          {(chosen.length > 0 && serialized && !editor) &&
            <div className={styles.tableHeader}>
            <span style={{flex: `0 1 ${width}`, width: width}}>
            <span>
            <span><IoAndroidCheckboxOutline size="16px"/>&nbsp;&nbsp;Export ?</span>
            </span>
            </span>
            {chosen.map((label, index) => {
              return <span key={index} style={{flex: `2 2 ${width}`, width: width}}>
                <span>{label.value}</span>
              </span>
            })}
          </div>}

            {(chosen.length > 0 && serialized && !editor) &&
              Object.keys(this.props.projects.data.entries).map((project, index) => {
                let pj = this.props.projects.data.entries[project]
              return (
                <div
                  className={styles.tableData}
                  key={index}
                  onClick={() => this.props.cancelProject(project)}>

                  <span style={{flex: `0 1 ${width}`, width: width}}>
                  {pj.export
                    ? <span><IoAndroidCheckboxOutline size="16px"/>{pj.export}</span>
                    : <span><IoAndroidCheckboxOutlineBlank size="16px"/>{pj.export}</span>
                  }
                  </span>

                   {chosen.map((label, index) => {
                      return (
                        <span key={index} style={{flex: `2 2 ${width}`, width: width}}>
                          <span>{pj[label.value]}</span>
                        </span>)
                    })}

                </div>)
            })}

              {(chosen.length > 0 && !serialized && !editor) &&
              chosen.map((label, index) => {

              let pj = this.props.projects.data.entries[label.value]

              return (
                <div
                  className={styles.tableData}
                  key={index}
                  onClick={() => this.props.cancelProject(label.value)}>

                  <span style={{flex: `0 1 ${width}`, width: width}}>
                  {pj.export
                    ? <span><IoAndroidCheckboxOutline size="16px"/>{pj.export}</span>
                    : <span><IoAndroidCheckboxOutlineBlank size="16px"/>{pj.export}</span>
                  }
                  </span>

                  <span style={{flex: `0 1 50%`}}>
                    <span>{label.value}</span>
                    </span>
                  <span style={{flex: `0 1 50%`}}>
                    <span>{pj.value}</span>
                  </span>

                </div>)
            })}
              </div>
              <div className={styles.tableFooter}>
                <span className={[
                  styles.columnEditorToggle,
                  editor ? styles.active: ''].join(' ')}
                  onClick={() => {this.setState({columnEditorOpen: !editor})}}
                >
                  <IoGearA size="16px"/> Column Editor
                </span>
                <span>
                {this.props.projects.data.entries &&
                  Object.keys(this.props.projects.data.entries).length}
                &nbsp;Entries in this table.
                </span>
              </div>
        </div>
    )
  }
}
