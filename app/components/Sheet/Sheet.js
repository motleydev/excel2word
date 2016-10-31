// @flow
import React, { Component } from 'react';
import styles from './Sheet.css'

import fs from 'fs'
const {dialog} = require('electron').remote

import {IoGearA,
  IoAndroidDone,
  IoAndroidCheckboxOutlineBlank,
  IoAndroidCheckboxOutline,
  IoAndroidClose} from 'react-icons/io'

import Button from '../../ui/Button/Button'

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

  changeName (e) {
    this.updateSheet({name: e.target.value})
  }

  serialCheck (e) {
    this.updateSheet({serialized: e.target.checked})
  }

  selectSheet () {
    if (this.props.sheet.selected === false ) {
      this.updateSheet({selected: true})
    }
  }

  deselectSheet () {
    if (this.props.sheet.selected === true ) {
      this.updateSheet({selected: false})
    }
  }

  openConfig () {
    this.updateSheet({configOpen: !this.props.sheet.configOpen})
  }

  addSchema () {

    dialog.showOpenDialog((fileName) => {

    var content = fs
      .readFileSync(fileName[0], "binary");
      this.updateSheet({schema: content})

    })

  }

  updateSheet (obj) {
    let payload = {...this.props.sheet, ...obj}
    this.props.updateSheet(this.props.index, payload)
  }

  render() {

    let {configOpen, selected, serialized, name} = this.props.sheet

    return (
      <div className={styles.sheet} onClick={this.selectSheet}>
        {!configOpen &&
          <div>
            <textarea type="text" value={name} onChange={this.changeName} />

            {selected &&
              <div>
                <div onClick={this.deselectSheet}><IoAndroidDone /></div>
                <div onClick={this.openConfig}><IoGearA /></div>
              </div>}

          </div>}

        {configOpen && <div>
          <label htmlFor="serialized">
          <span>Serialized?</span>
          <span>{ serialized
            ? <IoAndroidCheckboxOutline />
            : <IoAndroidCheckboxOutlineBlank />}</span>
            <input id="serialized" type="checkbox" checked={serialized} onChange={this.serialCheck} />
          </label>
          <div>
            <Button onClick={this.addSchema}>+ Add Schema</Button>
          </div>
          <div onClick={this.openConfig}><IoAndroidClose /></div>
        </div>}

      </div>
    )
  }
}
