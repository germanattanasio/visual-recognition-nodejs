import React from 'react';
import ReactDom from 'react-dom';
import {scrollToElement} from './demo.js';
import { isValidFile, alertsForFileInvalidity} from './train.js';
let jpath = require('jpath-query');
let jquery = $;
let { lookupName } = require('./classNameMapper.js');
let { allMissingClasses, bundleZipfileForClass } = require('./membership.js');
const image_count = 10;

class RetrainingIndicator extends React.Component {
  render() {
    return (<div className="loading retrain--loading">
        <div className="loader-container">
          <svg className="loader" viewBox="25 25 50 50">
            <circle className="loader__path" cx='50' cy='50' r='20'/>
          </svg>
        </div>
      <p className="base--p loading--message"> Watson is retraining your classifier. </p>
      <p className="base--p loading--message"> This might take up to 3-4 minutes based on number of images.</p>
        </div>);
  }
}

class FormTitleHOne extends React.Component {
  render() {
    return (<div className="retrain--header">
      <h2 className="title-bar base--h2">{this.props.name ? 'Retrain' : 'Hello'}
      <div className="status-bar">Classifier has status: {this.props.status}</div>
      </h2>

      <p className="base--p">Add more images to classes by uploading your own or adding a new class.</p>

      {this.props.status !== 'ready' ? <RetrainingIndicator/> : <div style={{display: 'none'}}></div>}
    </div>);
  }
}

class FormTitleBar extends React.Component {
  constructor() {
    super();
    this.state = {};
  }
  componentDidMount() {
    if (this.props.classifier_id) {
      this.retryRequest();
    }
  }

  componentWillUnmount() {
    if (this.serverRequest) {
      this.serverRequest.abort();
    }
  }
  retryRequest() {
    if (this.serverRequest && this.serverRequest.active) {
      this.serverRequest.abort();
    }

    // todo: see if there's a more appropriate location for this logic
    this.serverRequest = jquery.get('/api/classifiers/' + this.props.classifier_id).done(function (results) {
      if (this.state.submitted || results.status === 'retraining' || results.status === 'training') {
        setTimeout(this.retryRequest.bind(this), 5000);
      } else if (results.status === 'ready') {
        jquery('.test--output').hide();
        scrollToElement($('h2.test--classifier'));
      }
      this.setState({classifierData: results, submitted: false});
    }.bind(this));
  }

  willSubmit() {
    this.setState({submitted: true});
  }

  didSubmit(newClassifierData) {
    if (this.props.classifier_id) {
      this.setState({submitted: true, classifierData: newClassifierData});
      setTimeout(this.retryRequest.bind(this),1000);
    }
  }
  render() {
    if (this.state.classifierData) {
      return (<div className="improve--form">
        <FormTitleHOne status={this.state.submitted ? 'submitted' : this.state.classifierData.status} name={this.state.classifierData.name}/>
        <UpdateForm status={this.state.submitted ? 'submitted' : this.state.classifierData.status} classifier_id={this.state.classifierData.classifier_id} classes={this.state.classifierData.classes} willSubmit={this.willSubmit.bind(this)} afterSubmit={this.didSubmit.bind(this)}/></div>);
    } else {
      return (<div className="improve--Form"></div>);
    }
  }
}
class TrainClassCell extends React.Component {
  constructor() {
    super();
    this.state = { nameValue: '', checked: false };
  }

  drag(event) {
    event.preventDefault();
  }

  drop(parentAction,event) {
    event.preventDefault();
    if (!event.dataTransfer.files) {
      return false;
    }

    let fileToCheck = jpath.jpath('/dataTransfer/files/0',event)
    if (!isValidFile(fileToCheck)) {
     alertsForFileInvalidity(fileToCheck);
     return;
    }

    if (this.props.kind === 'new') {
      let trimmed_name = jpath.jpath('/dataTransfer/files/0/name', event).split('.')[0]
      this.setState({nameValue: trimmed_name, hasFile: true});
      parentAction(trimmed_name,jpath.jpath('/dataTransfer/files/0', event), 'add');
    } else {
      this.setState({hasFile: true});
      parentAction(this.props.name,jpath.jpath('/dataTransfer/files/0', event), 'add');
    }
  }
  handleClick(e) {
    if (this.props.kind === 'missing' && e.target.getAttribute('name') === 'Select') {
      e.preventDefault();
      return false;
    }
    if (e.target.getAttribute('name') === 'classname' || e.target.getAttribute('name') === 'clear' || e.target.getAttribute('type') === 'file') {
      return false;
    } else {
      e.preventDefault();
    }

    let parent_id = 'top-'+this.props.name;
    var element = e.target;
    while ( element.getAttribute('id') !== parent_id) {
      element = element.parentElement;
    }
    let target = element.firstElementChild.nextElementSibling;
    target.click();
    return false;
  }

  changeAction(parentAction,e) {
    e.preventDefault();

    let fileToCheck = jpath.jpath('/target/files/0',e)
    if (fileToCheck && !isValidFile(fileToCheck)) {
       alertsForFileInvalidity(fileToCheck);
       return;
    }
    
    if (jpath.jpath('/target/files/length', e, 0) > 0) {
      if (this.props.kind === 'new') {
        let trimmed_name = jpath.jpath('/target/files/0/name', e).split('.')[0]
        this.setState({nameValue: trimmed_name, hasFile: true});
        parentAction(trimmed_name,jpath.jpath('/target/files/0', e),'add');
      } else {
        this.setState({hasFile: true});
        parentAction(this.props.name,jpath.jpath('/target/files/0', e),'add');
      }
    } else {
      let classname = this.state.nameValue || this.props.name;
      parentAction(classname,null,'remove');
      this.setState({hasFile: false});
    }
}

  clear(parentAction,event) {
    event.preventDefault();
    event.target.previousSibling.value = null;
    if (this.props.kind === 'new') {
      let classname = this.state.nameValue || this.props.name;
      this.setState({nameValue: null, hasFile: false, checked: false});
      parentAction(classname,null,'remove');
    } else {
      this.setState({hasFile: false, checked: false});
      parentAction(this.props.name,null,'remove');
    }
  }
  textChange(e) {
    e.preventDefault();
    this.setState({nameValue: e.target.value});
  }

  inputStyle() {
    return {'new' : { width: '100%', textAlign: 'center',marginTop: '1rem', padding: '0.2em 0em', fontSize: '1rem', height: '2.5rem', 'border': '2px solid #ccc' },
      'negative'  : { display: 'none' },
      'positive'  : { display: 'none' },
      'missing'  : { display: 'none' }
    }[this.props.kind];
  }
  displayName() {
    return {'new' : '',
      'negative'  : lookupName(this.props.name),
      'positive'  : lookupName(this.props.name),
      'missing'    : lookupName(this.props.name)
    }[this.props.kind];
  }

  selectMissing(parentAction) {
    this.setState({hasFile: true, checked: true});
    parentAction(this.props.name, null, 'add');
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.classCount === 0) {
      this.setState({hasFile: false, nameValue: '', checked: false});
    }
  }
  render() {
    return (
        <div id={"top-"+this.props.name} className="base-div" onClick={this.handleClick.bind(this)} onDrop={this.drop.bind(this,this.props.parentAction)} onDragOver={this.drag.bind(this)}>
          <div className="target-div" id={this.props.name}>
            <h3 className="base--h3" title={this.displayName()}>
              {this.displayName()}
              <input style={this.inputStyle()} type="text" name="classname" onChange={this.textChange.bind(this)} placeholder="New Class" value={this.state.nameValue || this.props.name}/>
              <input style={{display: 'none'}} type="checkbox" name="missing" value={this.props.name} checked={this.state.checked}/>
            </h3>
            {this.props.kind === 'missing' ? <button style={{opacity: this.state.hasFile ? 0 : 1 }} onClick={this.selectMissing.bind(this,this.props.parentAction)} name="Select">Select</button> :
              <button style={{opacity: 0, display: (this.props.kind === 'new' || this.props.kind === 'negative') ? 'none' : 'block' }} disabled={true} name="Select">Select</button>
              }
            { this.state.hasFile ? <img className="text-zip-image" src="images/VR zip icon.svg"/> : <div className="target-box"><span className="decorated">upload</span> at least 50 images in zip format</div>}
          </div>
          <input onChange={this.changeAction.bind(this,this.props.parentAction)} style={{display: 'none'}} type="file" name={this.props.name} accept="application/zip"/>
          <button name="clear" className="clear--button" style={{opacity: this.state.hasFile ? 1 : 0, display: this.state.hasFile ? 'block' : 'none'}} onClick={this.clear.bind(this,this.props.parentAction)}>clear</button>
        </div>);
  }
}

class UnsubmittedClass extends React.Component {
  render() {
    return (<h1>{this.props.classname}</h1>);
  }
}

class FlashMessage extends React.Component {
  render() {
    if (this.props.display) {
      return (<div>{this.props.message}</div>);
    } else {
      return (<div style={{display: 'none'}}></div>);
    }
  }
}

class VisibleMessage extends React.Component {
  render() {
    if (this.props.visibility) {
      return (<div>{this.props.message}</div>);
    } else {
      return (<div style={{visibility: 'hidden'}}>&nbsp;</div>);
    }
  }
}

class WindowShade extends React.Component {
  constructor() {
    super();
    this.state = { clicked: false };
  }
  onclick(event) {
    if (event.target.getAttribute('data-kind') === 'target') {
      this.setState({clicked: !this.state.clicked});
    }
  }
  style() {
    return this.state.clicked ? { opacity: 1, visibility: 'visible' } : { opacity: 0, visibility: 'hidden' };
  }
  render() {
    return (<div className="windowShadeContainer" onClick={this.onclick.bind(this)}>
      <h3 className="base--h3 windowShadeLink base--a" data-kind="target">Add Another Class <img data-kind="target" className="chevron" src={this.state.clicked ? "/images/up-arrow.png" : "/images/down-arrow.png" }/></h3>
      <div className="windowshade" style={this.style()}>
        {this.props.children}
        </div>
    </div>);
  }
}

class UpdateForm extends React.Component {
  constructor() {
    super();
    this.state = { classCount: 0, files: {}, showFlash: false, checkboxes: new Set([]) };
  }
  addFile(classname, fileObj, action) {
    let newState = this.state;

    if (action === 'add') {
      if (fileObj) {
        newState.files[classname] = fileObj;
      } else {
        newState.checkboxes.add(classname);
      }
      newState.showFlash = true;
    }

    if (action === 'remove') {
      newState.showFlash = false;
      if (newState.files[classname]) {
        delete newState.files[classname];
      }

      if (newState.checkboxes.has(classname)) {
        newState.checkboxes.delete(classname);
      }
    }

    newState.classCount = Object.keys(newState.files).length + newState.checkboxes.size;
    this.setState(newState);

    if (newState.showFlash) {
      setTimeout(function () {
        this.setState({showFlash: false});
      }.bind(this), 3000);
    }
  }
  componentWillUnmount() {
    if (this.submitAction) {
      this.submitAction.abort();
    }
  }

  submit(e) {
    e.preventDefault();
    let filesDict = this.state.files;
    let uploadedFiles = Object.keys(this.state.files).reduce(function(store, item) {
      let f = filesDict[item];
      if (f.size && !item.match(/Negative Class/)) {
        store.append(item+ '_positive_examples',f);
      } else if (f.size && item.match(/Negative Class/)) {
        store.append('negative_examples',f);
      }
      return store;
    },new FormData());

    let includeMissing = [...this.state.checkboxes].reduce((store, item) => {
      let zipPath = bundleZipfileForClass(item);
      if (zipPath) {
        store.append(item+ '_positive_examples',zipPath);
      }
      return store;
    }, uploadedFiles);

    let beforeSubmitCallBack = this.props.willSubmit;
    let afterSubmitCallback = this.props.afterSubmit;
    beforeSubmitCallBack();
    e.target.reset();
    this.setState({classCount: 0, submitted: true});

    this.submitAction = jquery.ajax({ method: 'POST',
      url: '/api/retrain/' + this.props.classifier_id,
      data: includeMissing,
      contentType: false,
      dataType: 'json',
      processData: false
    }).done(function(data) {
      afterSubmitCallback ? afterSubmitCallback(data) : null;
      this.setState({submitted: false});
    }.bind(this)).fail(function(jxr, status,error) {
      afterSubmitCallback ? afterSubmitCallback({error: error}) : null;
      this.setState({submitted: false});
    }.bind(this));
  }

  missingClasses() {
    let classnames = this.props.classes.map(x => x.class);
    return allMissingClasses(classnames);
  }

  render() {
    let form_style = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyItems: 'center',
      marginTop: '2rem'
    };

    let submit_button_style = {
      cursor: "pointer",
    };

    let submit_button_style_disabled = {
      cursor: "not-allowed",
      backgroundColor: '#959595',
      borderColor: '#959595',
      height: '2.5rem',
      fontWeight: 500,
      width: 'calc(40% - 1rem)',
      marginBottom: '1rem'
    };

    let self = this;
    let classCount = this.state.classCount;
    let wasSubmitted = this.state.submitted || this.props.status !== 'ready';

    if (wasSubmitted) {
      return (<div style={{display: 'none'}}></div>);
    } else {

      return (<form style={form_style} onSubmit={this.submit.bind(this)}>

        <div className="existing">
          <h3 className="base--h3">Positive Classes</h3>
          <div className="positive-classes">
          {this.props.classes.map(function (item) {
            return (<TrainClassCell key={item.class} classCount={classCount} kind='positive'
                                    parentAction={self.addFile.bind(self)} name={item.class}/>);
          })}

            {this.missingClasses().map(function(item) {
              return (<TrainClassCell key={item} classCount={classCount} kind='missing'
                                      parentAction={self.addFile.bind(self)} name={item}/>);
            })}
          <WindowShade>
            <TrainClassCell classCount={classCount} key='newclass' kind='new' parentAction={this.addFile.bind(this)}
                            name="New Class"/>
            </WindowShade>
            </div>
            <VisibleMessage message="New images added!" visibility={this.state.showFlash}/>
          <h3 className="base--h3">Optional Negative Images</h3>
          <div className="negative-classes">
        <TrainClassCell key="negative-class" kind='negative' classCount={classCount}
                        parentAction={this.addFile.bind(this)} name='Negative Class'/>
          </div>
        </div>
        {this.state.classCount < 1 ? <div>Add at least one zipped file</div> : <div style={{display: 'none'}}></div>}
        { this.state.classCount > 0 ?
            <input className="base--button" style={submit_button_style} type="submit"
                   value="Retrain your classifier"/> :
            <input className="base--button disabled" style={submit_button_style_disabled} disabled={true} type="submit"
                   value="Retrain your classifier"/>
        }
        <p className="base--p">This is a demo. For full functionality, try out the API.</p>
      </form>);
    }
  }
}

export default FormTitleBar;

export function displayRetrainingForm(classifier_id, targetid) {
  let target = document.getElementById(targetid);
  if (target) {
    ReactDom.render(<FormTitleBar classifier_id={classifier_id}/>, target);
  }
}
