import React from 'react';

const Button = (props) => {
  return <button className="btn btn-default" onClick={props.onClick}>{props.text}</button>;
};

export default Button;
