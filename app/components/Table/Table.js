import React, { Component, PropTypes } from 'react'
// Components
import {
  IoAndroidCheckboxOutlineBlank,
  IoAndroidCheckboxOutline,
  IoGearA,
} from 'react-icons/io'
import Button from '../../ui/Button/Button'
// Style
import styles from './Table.css'

export default class Table extends Component {

  constructor(props) {
    super(props)

    this.state = {
      columnEditorOpen: true,
    }
  }

  render() {
    const { projects } = this.props
    const { serialized } = projects
    const { labels, message, error } = projects.data
    const editor = this.state.columnEditorOpen

    const chosen = labels ? labels.filter(label => label.chosen) : []
    const width = `${((100 / (chosen.length + 1)) * 100) / 100}%`

    return (
      <div className={styles.projectList}>

        <div className={styles.table}>

          { error &&
          <div className={styles.error}>
            <div><h2>{message}</h2></div>
          </div> }

          {(editor && !error) &&

          <div className={styles.editor}>
            { labels &&
            <div className={styles.labels}>
              {labels.map((label, index) => {
                const style = [
                  styles.base,
                  label.chosen ? styles.chosen : '',
                ].join(' ')

                return (
                  <div
                    className={style}
                    key={index}
                    onClick={() => this.props.toggleLabel(index)}
                  >{label.value}</div>)
              })}
            </div> }

            <div className={styles.message}>
              <p>Please choose some column headings above</p>
            </div>
            <div>
              <Button onClick={() => { this.setState({ columnEditorOpen: !editor }) }}>Done</Button>
            </div>

          </div> }

          {(chosen.length > 0 && serialized && !editor) &&
          <div className={styles.tableHeader}>
            <span style={{ flex: `0 1 ${width}`, width }}>
              <span>
                <span>
                  <IoAndroidCheckboxOutline size="16px" />
                  &nbsp;&nbsp;Export ?
                </span>
              </span>
            </span>
            {chosen.map((label, index) => {
              return (
                <span key={index} style={{ flex: `2 2 ${width}`, width }}>
                  <span>{label.value}</span>
                </span>)
            })}
          </div>}

          {(chosen.length > 0 && serialized && !editor) &&
            Object.keys(this.props.projects.data.entries).map((project, index) => {
              const pj = this.props.projects.data.entries[project]

              return (
                <div
                  className={styles.tableData}
                  key={index}
                  onClick={() => this.props.cancelProject(project)}
                >

                  <span style={{ flex: `0 1 ${width}`, width }}>
                    {pj.export
                      ? <span><IoAndroidCheckboxOutline size="16px" />{pj.export}</span>
                      : <span><IoAndroidCheckboxOutlineBlank size="16px" />{pj.export}</span>
                    }
                  </span>

                  {chosen.map((label, childIndex) => {
                    return (
                      <span key={childIndex} style={{ flex: `2 2 ${width}`, width }}>
                        <span>{pj[label.value]}</span>
                      </span>)
                  })}

                </div>)
            })
          }

          {(chosen.length > 0 && !serialized && !editor) &&
            chosen.map((label, index) => {
              const pj = this.props.projects.data.entries[label.value]
              return (
                <div
                  className={styles.tableData}
                  key={index}
                  onClick={() => this.props.cancelProject(label.value)}
                >

                  <span style={{ flex: `0 1 ${width}`, width }}>
                    {pj.export
                      ? <span><IoAndroidCheckboxOutline size="16px" />{ pj.export }</span>
                      : <span><IoAndroidCheckboxOutlineBlank size="16px" />{ pj.export }</span>
                    }
                  </span>

                  <span style={{ flex: '0 1 50%' }}>
                    <span>{label.value}</span>
                  </span>

                  <span style={{ flex: '0 1 50%' }}>
                    <span>{pj.value}</span>
                  </span>

                </div>)
            })
          }
        </div>
        <div className={styles.tableFooter}>
          <span
            className={[
              styles.columnEditorToggle,
              editor ? styles.active : ''].join(' ')}
            onClick={() => { this.setState({ columnEditorOpen: !editor }) }}
          >
            <IoGearA size="16px" /> Column Editor
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

Table.propTypes = {
  projects: PropTypes.shape({
    data: PropTypes.shape({
      entries: PropTypes.array,
    }),
  }),
  cancelProject: PropTypes.func,
  toggleLabel: PropTypes.func,
}
