// @flow
import React from 'react';
import style from './button.css';

const Button = (props) => {
    return (
      <div className={style.button} onClick={()=> props.onClick()}>
        <p>{props.children}</p>
      </div>
    );
}

export default Button