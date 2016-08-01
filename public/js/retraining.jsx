import React from 'react';
import ReactDom from 'react-dom';
let jpath = require('jpath-query');
let jquery = require('jquery');

let div_style = {
  padding: '0.5rem',
  marginRight: '1rem',
  marginBottom: '1rem',
  textAlign: 'center',
  width: '20vw',
  border: 'dashed 1px grey',
  height: '20vw',
  maxHeight: '20vw',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const image_count = 10;

class RetrainingIndicator extends React.Component {
  render() {
    return (<div className="loading.train--loading">
        <div className="loader-container">
          <svg className="loader" viewBox="25 25 50 50">
            <circle className="loader__path" cx='50' cy='50' r='20'/>
          </svg>
        </div>
      <p className="base--p loading--message"> Watson is training your new classifier. </p>
      <p className="base--p loading--message"> This might take up to 4-5 minutes based on number of images.</p>
        </div>);
  }
}

class FormTitleHOne extends React.Component {
  render() {
    return (<div className="retrain--header">
      <h1 className="title-bar">{this.props.name ? 'Improve classifier: ' + this.props.name : 'Hello'}</h1>
      <h3>Classifier has status: {this.props.status}</h3>
      {this.props.status === 'retraining' ? <RetrainingIndicator/> : ''}
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

  afterSubmit() {
    if (this.props.classifier_id) {
      this.serverRequest = jquery.get('/api/classifiers/' + this.props.classifier_id).done(function (results) {
        this.setState({classifierData: results});
      }.bind(this));
    }
  }
  render() {
    if (this.state.classifierData) {
      return (<div className="improve--form">
        <FormTitleHOne status={this.state.classifierData.status} name={this.state.classifierData.name}/>
        <UpdateForm classifier_id={this.state.classifierData.classifier_id} classes={this.state.classifierData.classes} afterSubmit={this.afterSubmit.bind(this)}/></div>);
    } else {
      return (<div className="improve--Form"></div>);
    }
  }
}
class TrainClassCell extends React.Component {
  constructor() {
    super();
    this.state = { nameValue: '' };
  }
  handleClick(e) {
    e.preventDefault();
    if (e.target.getAttribute('name') === 'classname') {
      return false;
    }
    let parent_id = 'top-'+this.props.name;
    var element = e.target;
    while ( element.getAttribute('id') !== parent_id) {
      element = element.parentElement;
    }
    element.firstElementChild.nextElementSibling.dispatchEvent(new Event('click'));
    return false;
  }
  changeAction(parentAction,e) {
    e.preventDefault();

    let validMimeType = {'application/zip': true}[jpath.jpath('/target/files/0/type',e)];
    if (jpath.jpath('/target/files/length', e, 0) > 0) {
      if (validMimeType) {
        parentAction(jpath.jpath('/target/files/0', e));

        if (this.props.kind === 'new') {
          let trimmed_name = jpath.jpath('/target/files/0/name', e).split('.')[0]
          this.setState({nameValue: trimmed_name, has_file: true});
        } else {
          this.setState({has_file: true});
        }
      }
    } else {
      parentAction(null);
      this.setState({has_file: false});
    }
  }
  textChange(e) {
    e.preventDefault();
    this.setState({nameValue: e.target.value});
  }

  inputStyle() {
    return {'new' : { width: '80%'},
      'negative'  : { display: 'none' },
      'positive'  : { display: 'none' }
    }[this.props.kind];
  }
  displayName() {
    return {'new' : '',
      'negative'  : this.props.name,
      'positive'  : this.props.name
    }[this.props.kind];
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.classCount === 0) {
      this.setState({has_file: false, nameValue: ''});
    }
  }
  render() {
    return (
        <div id={"top-"+this.props.name} style={div_style} onClick={this.handleClick.bind(this)}>
          <div id={this.props.name}>
            <h3 className="base--h3">
              {this.displayName()}
              <input style={this.inputStyle()} type="text" name="classname" onChange={this.textChange.bind(this)} placeholder="New Class" value={this.state.nameValue || this.props.name}/>
            </h3>
            { this.state.has_file? <img className="text-zip-image" src="images/VR zip icon.svg"/> : <div><span className="text-label">Select</span>
            <div>or drag a zipped folder with at least {image_count} images</div></div>}
          </div>
          <input onChange={this.changeAction.bind(this,this.props.parentAction)} style={{display: 'none'}} type="file" name={this.props.name}/>
        </div>);
  }
}

class UpdateForm extends React.Component {
  constructor() {
    super();
    this.state = { classCount: 0 }
  }
  addFile(fileObj) {
    let newCount = fileObj ? this.state.classCount + 1 : this.state.classCount - 1;
    this.setState({classCount: newCount });
  }
  componentWillUnmount() {
    if (this.submitAction) {
      this.submitAction.abort();
    }
  }

  submit(e) {
    e.preventDefault();
    let q = new FormData(e.target);
    let filtered_form = q.getAll('classname').reduce(function(store, item) { let f = q.get(item) || q.get('New Class');
      console.log(f);
      if (f.size && !item.match(/Negative Class/)) {
        store.append(item+"_positive_examples",f);
      } else if (f.size && item.match(/Negative Class/)) {
        store.append('negative_examples',f);
      }
      return store;
    },new FormData());

    let afterSubmitCallback = this.props.afterSubmit;

    e.target.reset();
    this.setState({classCount: 0});

    this.submitAction = jquery.ajax({ method: 'POST',
      url: '/api/retrain/' + this.props.classifier_id,
      data: filtered_form,
      contentType: false,
      dataType: 'json',
      processData: false
    }).done(function(data) {
      afterSubmitCallback ? afterSubmitCallback() : null;
    }.bind(this)).fail(function(jxr, status,error) {
      afterSubmitCallback ? afterSubmitCallback() : null;
    }.bind(this));
  }

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
      WebkitBorderRadius: "5px",
      borderRadius: "5px"
    };
    let self = this;
    let classCount = this.state.classCount;

    return (<form style={form_style} onSubmit={this.submit.bind(this)}>

      <div style={div_a_style} className="existing">

        {this.props.classes.map(function(item) {
          return (<TrainClassCell key={item.class} classCount={classCount} kind='positive' parentAction={self.addFile.bind(self)} name={item.class}/>);
        })}
        <TrainClassCell classCount={classCount} key='newclass' kind='new' parentAction={this.addFile.bind(this)} name="New Class"/>
      </div>
      <TrainClassCell key="negative-class" kind='negative' classCount={classCount} parentAction={this.addFile.bind(this)} name='Negative Class'/>
      {this.state.classCount < 1 ? <div>Add At Least One Zip File</div> : ''}
      <input style={submit_button_style} disabled={this.state.classCount < 1} type="submit" value="Submit"/>
    </form>);
  }
}

export default FormTitleBar;

export function displayRetrainingForm(classifier_id, targetid) {
  ReactDom.render(<FormTitleBar classifier_id={classifier_id}/>, document.getElementById(targetid));
}