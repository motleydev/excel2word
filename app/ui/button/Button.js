import React from 'react'
import style from './button.css'

const Button = props => (
  <button
    className={style.button}
    onClick={() => props.onClick()}
    disabled={props.disabled}
  ><p>{props.children}</p>
  </button>
)

Button.propTypes = {
  onClick: React.PropTypes.func,
  children: React.PropTypes.string,
  disabled: React.PropTypes.bool,
}

export default Button
