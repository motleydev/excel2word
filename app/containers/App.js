import React, { Component, PropTypes } from 'react'
import style from './app.css'

export default class App extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
  }

  render() {
    return (
      <div className={style.app}>
        {this.props.children}
      </div>
    )
  }
}
