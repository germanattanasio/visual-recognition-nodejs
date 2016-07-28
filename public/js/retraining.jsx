import React from 'react';
import ReactDom from 'react-dom';
let jpath = require('jpath-query');
let jquery = require('jquery');

let div_style = {
  padding: '0.5rem',
  marginRight: '1rem',
  marginBottom: '1rem',
  textAlign: 'center',
  width: '10vw',
  border: 'dashed 1px grey',
  height: '10vw',
  maxHeight: '10vw',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const image_count = 10;

class FormTitleHOne extends React.Component {
  render() {
    return <h1 className="title-bar">{this.props.name ? 'Improve classifier: ' + this.props.name : 'Hello'}</h1>
  }
}

class FormTitleBar extends React.Component {
  constructor() {
    super();
    this.state = {};
  }
  componentDidMount() {
    if (this.props.classifier_id) {
      this.serverRequest = jquery.get('/api/classifiers/' + this.props.classifier_id).done(function (results) {
        this.setState({classifierData: results});
      }.bind(this));
    }
  }
  componentWillUnmount() {
    if (this.serverRequest) {
      this.serverRequest.abort();
    }
  }
  styles() {
    return {display: 'none' }
  }
  render() {
    if (this.state.classifierData) {
      return (<div className="improve--form"><FormTitleBar name={this.state.classifierData.name}/>
        <UpdateForm classes={this.state.classifierData.classes}/></div>);
    } else {
      return (<div className="improve--Form"></div>);
    }
  }
}
class NewClassCell extends React.Component {
  handleClick(e) {
    e.preventDefault();
    e.target.firstElementChild.nextElementSibling.dispatchEvent(new Event('click'));
    return false;
  }
  render() {
    let input_style = { width: '80%'};
    return (
        <div style={div_style} onClick={this.handleClick.bind(this)}>
          <div id={this.props.name}>
            <h3 className="base--h3"><input style={input_style} type="text" name="newclassname"placeholder="New Class"/></h3>
            <span className="text-label">Select</span>
            <div>or drag a zipped folder with at least {image_count} images</div>
          </div>
          <input onChange={this.props.changeAction} style={{display: 'none'}} type="file" name={this.props.name}/>

        </div>);
  }
}

class UpdateCell extends React.Component {
  handleClick(e) {
    e.preventDefault();
    e.target.firstElementChild.nextElementSibling.dispatchEvent(new Event('click'));
    return false;
  }
  render() {

    return (
        <div style={div_style} onClick={this.handleClick.bind(this)}>
          <div id={this.props.name}>
            <h3 className="base--h3">{this.props.name}</h3>
            <span className="text-label">Select</span>
            <div>or drag a zipped folder with at least {image_count} images</div>
          </div>
          <input onChange={this.props.changeAction} style={{display: 'none'}} type="file" name={this.props.name}/>
        </div>);
  }
}

class UpdateForm extends React.Component {
  render() {
    let form_style = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyItems: 'center'
    };

    let div_a_style = {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyItems: 'center'
    };

    let submit_button_style = {
      padding : "5px 15px",
      width: "100%",
      background: "#ccc",
      border: "0 none",
      cursor: "pointer",
      "-webkit-border-radius": "5px",
      borderRadius: "5px"
    };

    return (<form style={form_style}>
      <div style={div_a_style} className="existing">
        {this.props.classes.map(function(item) {
          return (<UpdateCell name={item.class}/>);
        })}
        <NewClassCell name="New Class"/>
      </div>
      <UpdateCell name='Negative Class'/>
      <input style={submit_button_style} type="submit" value="Submit"/>
    </form>);
  }
}

export default FormTitleBar;

export function exportTable(classifier_id) {
  ReactDom.render(<FormTitleBar classifier_id={classifier_id}/>, document.getElementById('target'));
}