import React from 'react';
import ReactDom from 'react-dom';

class ErrorMessage extends React.Component {
  render() {
    return (<div className="error--message train-selection">{this.props.messageText}</div>);
  }
}

export default ErrorMessage;

export function renderErrorMessage(msg, tagid) {
  ReactDom.render(<ErrorMessage messageText={msg}/>,document.getElementById(tagid));
}