import { React, PropTypes } from 'react'
import style from './button.css'

const Button = (props) => {
  return (
    <div className={style.button} onClick={() => props.onClick()}>
      <p>{props.children}</p>
    </div>
  )
}

Button.propTypes = {
  onClick: PropTypes.func,
  children: PropTypes.text,
}

export default Button
