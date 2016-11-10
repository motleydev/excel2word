import React, { Component, PropTypes } from 'react'
// Libs
import fs from 'fs'
// Components
import { IoGearA,
  IoAndroidDone,
  IoAndroidCheckboxOutlineBlank,
  IoAndroidCheckboxOutline,
  IoAndroidClose } from 'react-icons/io'
// Style
import styles from './Sheet.css'
// Utils
import Button from '../../ui/Button/Button'

const { dialog } = require('electron').remote

export default class Sheet extends Component {
  constructor(props) {
    super(props)

    this.changeName = this.changeName.bind(this)
    this.serialCheck = this.serialCheck.bind(this)
    this.addSchema = this.addSchema.bind(this)
    this.openConfig = this.openConfig.bind(this)
    this.selectSheet = this.selectSheet.bind(this)
    this.deselectSheet = this.deselectSheet.bind(this)
    this.updateSheet = this.updateSheet.bind(this)
  }

  changeName(e) {
    this.updateSheet({ name: e.target.value })
  }

  serialCheck(e) {
    e.preventDefault()
    this.updateSheet({ serialized: e.target.checked })
  }

  selectSheet() {
    if (this.props.sheet.selected === false) {
      this.updateSheet({ selected: true })
    }
  }

  deselectSheet() {
    if (this.props.sheet.selected === true) {
      this.updateSheet({ selected: false })
    }
  }

  openConfig() {
    this.updateSheet({ configOpen: !this.props.sheet.configOpen })
  }

  addSchema() {
    dialog.showOpenDialog((fileName) => {
      const content = fs.readFileSync(fileName[0], 'utf8')

      const json = JSON.parse(content)

      this.updateSheet({ schema: json })
    })
  }

  updateSheet(obj) {
    const payload = { ...this.props.sheet, ...obj }
    this.props.updateSheet(this.props.index, payload)
  }

  render() {
    const { configOpen, selected, serialized, name } = this.props.sheet
    const baseStyles = [styles.sheet, selected ? styles.selected : ''].join(' ')

    return (
      <div className={baseStyles} onClick={this.selectSheet}>
        {!configOpen &&
          <div className={styles.frontPane}>
            <textarea type="text" value={name} onChange={this.changeName} />

            {selected &&
              <div className={styles.frontPaneButtons}>
                <div>
                  <span onClick={this.openConfig}>
                    <IoGearA size="1.5rem" fill="white" />
                  </span>
                </div>
                <div>
                  <span onClick={this.deselectSheet}>
                    <IoAndroidClose size="1.5rem" fill="white" />
                  </span>
                </div>
              </div>}

          </div>}

        {configOpen &&
          <div className={styles.configPane}>

            <div>
              <label htmlFor={`serialized${this.props.index}`}>
                <span>Serialized?</span>
                <span>{ serialized
                  ? <IoAndroidCheckboxOutline size="1.5rem" fill="white" />
                  : <IoAndroidCheckboxOutlineBlank size="1.5rem" fill="white" />}</span>
                <input
                  id={`serialized${this.props.index}`}
                  type="checkbox"
                  checked={serialized}
                  onChange={this.serialCheck}
                />
              </label>
            </div>

            <div>
              <Button onClick={this.addSchema}>+ Add Schema</Button>
            </div>

            <div>
              <span onClick={this.openConfig}>
                <IoAndroidDone size="1.5rem" fill="white" />
              </span>
            </div>
          </div>}

      </div>
    )
  }
}

Sheet.propTypes = {
  sheet: PropTypes.shape({
    selected: PropTypes.bool,
    configOpen: PropTypes.bool,
    serialized: PropTypes.bool,
    name: PropTypes.string,
  }),
  index: PropTypes.number,
  updateSheet: PropTypes.func,
}
