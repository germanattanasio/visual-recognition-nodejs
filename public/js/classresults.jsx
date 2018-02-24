import React from 'react';
import ReactDom from 'react-dom';
let jpath = require('jpath-query');

let base64Object = function(arg) {
  let buf = new Buffer(JSON.stringify(arg));
  return buf.toString('base64');
}

class GreatCF extends React.Component {
  bluemixURL() {
    return "https://console.bluemix.net/registration/trial?target=%2Fdeveloper%2Fwatson%2Fcreate-project%3Fservices%3Dwatson_vision_combined%26hideTours%3Dtrue&cm_mmc%3DOSocial_Tumblr-_-Watson%2BCore_Watson%2BCore%2B-%2BPlatform-_-WW_WW-_-wdc-ref%26cm_mmc%3DOSocial_Tumblr-_-Watson%2BCore_Watson%2BCore%2B-%2BPlatform-_-WW_WW-_-wdc-ref%26cm_mmca1%3D000000OF%26cm_mmca2%3D10000409%";
  }
  render() {
    return (<div className="greatcf">
      <p>Great! Now try the service with your own data <a className="base--a" href={this.bluemixURL()}>on Bluemix</a>.</p>
      <div className="buttonZone">
        <button className="bottomButton" onClick={function() { window.location=this.bluemixURL();}.bind(this)}>Go To Bluemix</button>
      </div>
    </div>);
  }
}

function scrollWindowBySmoothly(ybypx, inSeconds) {
  if (!window.requestAnimationFrame) {
    window.scrollBy(0,ybypx);
  } else {
    var remainingTime = inSeconds * 1000;
    let pxpms = ybypx / (inSeconds * 1000);
    var lastTime = null;
    var moveBy = 0;
    let smoothly = function(timestamp) {
      lastTime = lastTime || timestamp;
      let delta = timestamp - lastTime;
      if (moveBy < 1) {
        moveBy = moveBy + (pxpms * delta);
      } else {
        moveBy = moveBy + (pxpms * delta);
        window.scrollBy(0,moveBy);
        moveBy = 0;
      }
      remainingTime = remainingTime - delta;
      lastTime = timestamp;
      if (remainingTime > 0) {
        window.requestAnimationFrame(smoothly);
      }
    }
    window.requestAnimationFrame(smoothly);
  }
}

class MaybeCF extends React.Component {
  onClick(e) {
    e.preventDefault();
    scrollWindowBySmoothly(e.target.getBoundingClientRect().bottom, 0.5);
  }
  render() {
    return (<div className="maybecf">
      <p>We can make this better:</p>
      <p>Add more positive and negative images.</p>
      <p>Make sure your negative images are similar to, but different than your classifier.</p>
      <p>Make sure you have an even amount of positive and negative images.</p>
      <div className="buttonZone">
        <button onClick={this.onClick.bind(this)} className="bottomButton">Improve Classifier</button>
      </div>
    </div>)
  }
}

class NoCF extends React.Component {
  onClick(e) {
    e.preventDefault();
    scrollWindowBySmoothly(e.target.getBoundingClientRect().bottom, 0.5);
  }
  render() {
    return (<div className="nocf">
      <p>This classifier needs more training:</p>
      <p>Add more positive and negative images.</p>
      <p>Make sure your negative images are similar to, but different than your classifier.</p>
      <p>Make sure you have an even amount of positive and negative images.</p>
      <div className="buttonZone">
        <button onClick={this.onClick.bind(this)} className="bottomButton">Improve Classifier</button>
      </div>
    </div>)
  }
}
class CorrectForm extends React.Component {
  constructor() {
    super();
    this.state = { selected: null };
  }
  handleClick(selected,event) {
    event.preventDefault();
    this.setState({selected: selected})
  }

  choosePanel() {
    if (this.state.selected == 'yes') {
      return (<GreatCF/>);
    } else if (this.state.selected == 'maybe') {
      return (<MaybeCF/>);
    } else if (this.state.selected == 'no') {
      return (<NoCF/>);
    } else {
      return (<div style={{display: 'none'}}></div>);
    }
  }
  render() {
    return (<tr className="base--tr">
      <td className="base--td" colSpan="2">
        <hr/>
        <div className="correctForm">
          <h3 className="iscorrect base--h3">Is this correct?</h3>
          <div className="correctButtons">
            <button className={this.state.selected === 'yes' ? 'selected' : 'unselected'} onClick={this.handleClick.bind(this,'yes')}>Yes</button>
            <button className={this.state.selected === 'maybe' ? 'selected' : 'unselected'} onClick={this.handleClick.bind(this,'maybe')}>Maybe</button>
            <button className={this.state.selected === 'no' ? 'selected' : 'unselected'} onClick={this.handleClick.bind(this,'no')}>No</button>
          </div>
          <hr/>
          {this.choosePanel()}
        </div>
        </td>
      </tr>);
  }
}

class WowFormInputForm extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  handleChange(event) {
    var newState = { changed: true, yes: false, no: false};
    newState[event.target.value] = event.target.checked;
    this.setState(newState);
    setTimeout(function() {
      newState.changed = false;
      this.setState(newState);
    }.bind(this), 2000);
  }
  render() {
    var showStyle = {
      backgroundColor: 'green',
      WebkitTransition: 'background-color 1s ease-in-out',
      msTransition: 'background-color 1s ease-in-out',
      color: 'white',
      opacity: 1.0
    };

    var baseStyle = {
      backgroundColor: 'white',
      WebkitTransition: 'background-color 1s ease-in-out',
      msTransition: 'background-color 1s ease-in-out',
    };

    if (this.state.changed) {

      return (<tr style={showStyle} className="base--tr">
        <td colSpan="2" className="base--td results-table--feedback">
          <span className="results-table--feedback-inputs">
            <div style={{textAlign: 'center'}}>
              <span style={{opacity: 1.0, color: 'white'}} className="results-table--feedback-thanks">
                <em className="base--em">Thank You</em>
              </span>
            </div>
          </span>
        </td>
      </tr>);
    }
    return (<tr style={baseStyle} className="base--tr">
          <td colSpan="2" className="base--td results-table--feedback"><span className="results-table--feedback-inputs">
      <label><em className="base--em">Did We Wow You?</em></label>
      <input type='hidden' name='category' value={this.props.category}/>
      <input role="radio"
             onChange={this.handleChange.bind(this)}
             type="radio" id={this.props.name + '-yes'}
             name={this.props.name + '-group'} value='yes'
             className="base--radio results-table--input-yes"
             checked={this.state.yes}/>
      <label htmlFor={this.props.name +'-yes'} className="base--inline-label results-table--input-yes-label">Yes</label>
      <input role="radio"
             onChange={this.handleChange.bind(this)}
             type="radio" id={this.props.name + '-no'}
             name={this.props.name + '-group'} value="no"
             className="base--radio results-table--input-no"
             checked={this.state.no}/>
      <label htmlFor={this.props.name + '-no'} className="base--inline-label results-table--input-no-label">No</label>
    </span>
            </td>
          </tr>);
  }
}

class WowForm extends React.Component {
  render() {
    return (<WowFormInputForm category={this.props.category} name={this.props.name}/>);
  }}

class TypeHierarchy extends React.Component {
  filtered() {
    return this.props.type_hierarchy;
  }
  render() {
    return (<tr className="base--tr">
      <td colSpan="2" className="base--td">{this.filtered()}</td>
    </tr>);
  }
}

class JsonLink extends React.Component {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick(event) {
    event.preventDefault();
    var newWindow = window.open('', '_blank');
    newWindow.document.write("<pre>" + JSON.stringify(this.props.rawjson, null, 2) + "</pre>");
    newWindow.document.close()
  }
  render() {
    return (<div className="results--json">
      <a onClick={this.handleClick} target="_blank" className="json">JSON <img src="/images/link_image.png"/></a>
    </div>);
  }
}

class ScoreTableHeader extends React.Component {
  render() {
    return (<thead className="base--thead">
    <tr className="base--tr">
      <th className="base--th results-table--header">{this.props.title}</th>
      <th className="base--th results-table--header">Score</th>
    </tr>
    </thead>);
  }
}

class ClassifyScoreRow extends React.Component {
  scoreColor() {
    if (this.props.score > 0.75) {
      return "results-table--score-value results-table--score-value_good";
    } else if (this.props.score < 0.5) {
      return "results-table--score-value results-table--score-value_bad";
    } else {
      return "results-table--score-value results-table--score-value_ok";
    }
  }
  render() {
    return (<tr className="base--tr">
      <td className="base--td result--class">{this.props.name}</td>
      <td className="base--td result--score">
        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyItems: 'center'}}>
          <div className={this.scoreColor()}>
            {this.props.score}
          </div>
          <img className="result--thermometer" src={"/thermometer?score=" + this.props.score}/>
        </div>
      </td>
    </tr>);
  }
}

class GenderScoreRow extends React.Component {
  render() {
    return (<ClassifyScoreRow score={this.props.score} name={this.props.gender.toLowerCase()}/>);
  }
}

class AgeScoreRow extends ClassifyScoreRow {
  render() {
    return (<tr className="base--tr">
      <td className="base--td result--class">age {this.props.min} - {this.props.max}</td>
      <td className="base--td result--score">
        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyItems: 'center'}}>
          <div className={this.scoreColor()}>
            {this.props.score}
          </div>
          <img className="result--thermometer" src={"/thermometer?score=" + this.props.score}/>
        </div>
      </td>
    </tr>);
  }
}

class IdentityTypeHiearchy extends TypeHierarchy {
  filtered() {
    var results = this.props.type_hierarchy;
    if (results) {
      results = results.replace(/^\/|\/$/g, ''); // trim first / and last /
      results = results.replace(/\//g, ' > ');  // change slashes to >'s
    }
    return results;
  }
}

class ClassifyScoreTable extends React.Component {
  render() {
    if (this.props.items && this.props.items.length === 0) {
      if (this.props.faceCount === 0 && this.props.wordCount === 0) {
        return (<div className="use--mismatch">
          The score for this image is not above the threshold of 0.5</div>);
      } else {
        return (<div className="hidden"> </div>);
      }
    }
    return (
        <div className="results-table--container">
          <JsonLink rawjson={this.props.rawjson}/>
          <table className="base--table results-table">
            <ScoreTableHeader title={this.props.category}/>
            <tbody className="base--tbody">
            {this.props.items.map(function(item) {
              return (<ClassifyScoreRow key={item['class']} name={item['class']} score={item['score'].toFixed(2)}/>);
            })}
            </tbody>

            <tbody style={this.props.items.filter(function(item) { return item.type_hierarchy; }).length ? {} : {display: 'none'}} className="base--tbody">
            <tr className="base--tr">
              <th colSpan="2" className="base--th">
                <hr className="base--hr results-table--line-break"/>
              </th>
            </tr>
            <tr className="base--tr">
              <th colSpan="2" className="base--th">Type Hierarchy</th>
            </tr></tbody>
            <tbody className="base--tbody">
            {this.props.items.filter(function(item) { return item.type_hierarchy; }).map(function(item) {
              return (<TypeHierarchy key={item.type_hierarchy} type_hierarchy={item.type_hierarchy}/>);
            })}

            <WowForm name='class'/>
            </tbody>
          </table>
        </div>
    );
  }
}

class CustomClassifyScoreTable extends React.Component {
  render() {
    if (this.props.items && this.props.items.length == 0) {
      return (
          <table className="base--table results-table">
            <tbody className="base--tbody">
            <tr className="base--tr">
              <td className="base--td" colSpan="2">
                <p>The score for this image is not above the threshold of 0.5 based on the training data provided.</p>
              </td>
            </tr>
            </tbody>
            <tbody className="base--tbody">
            <CorrectForm/>
            </tbody>
          </table>
      );
    }
    return (
        <div className="results-table--container">
          <JsonLink rawjson={this.props.rawjson}/>
          <table className="base--table results-table">
            <ScoreTableHeader title={this.props.category}/>
            <tbody className="base--tbody">
            {this.props.items.map(function (item) {
              return (<ClassifyScoreRow key={item['class']} name={item['class']} score={item['score'].toFixed(2)}/>);
            })}
            </tbody>
            <tbody className="base--tbody">
            <CorrectForm/>
            </tbody>
          </table>
        </div>
    );
  }
}

class FoodScoreTable extends React.Component {
  render() {
    return (
        <div className="results-table--container">
          <JsonLink rawjson={this.props.rawjson}/>
          <table className="base--table results-table">
            <ScoreTableHeader title={this.props.category}/>
            <tbody className="base--tbody">
            {this.props.items.map(item => (
              <ClassifyScoreRow key={item.class} name={item.class} score={item.score.toFixed(2)} />
            ))}
            </tbody>
            <tbody className="base--tbody">
            <WowForm name={this.props.category}/>
            </tbody>
          </table>
        </div>
    );
  }
}

class FaceScoreTable extends React.Component {
  render() {
    return (
        <div className="results-table--container">
          <div className="beta-tag">Public Beta</div>
          <JsonLink rawjson={this.props.rawjson}/>
          <table className="base--table results-table">
            <ScoreTableHeader title={this.props.category}/>
            {this.props.items.map(function(item) {
              let age = jpath.jpath('/age',item);
              let gender = jpath.jpath('/gender',item);
              let identity = jpath.jpath('/identity',item);
              if (identity) {
                return (<tbody key={base64Object(item)} className="base--tbody">
                <AgeScoreRow key={base64Object(age)} min={age.min} max={age.max} score={age.score.toFixed(2)}/>
                <GenderScoreRow key={base64Object(gender)} gender={gender.gender} score={gender.score.toFixed(2)}/>
                <tr className="base--tr">
                  <th colSpan="2" className="base--th">
                    <hr className="base--hr results-table--line-break"/>
                  </th>
                </tr>
                <tr className="base--tr">
                  <th colSpan="2" className="base--th">Celebrity Match</th>
                </tr>
                <ClassifyScoreRow key={base64Object(identity)} name={identity.name} score={identity.score.toFixed(2)}/>
                <IdentityTypeHiearchy key={identity.type_hierarchy} type_hierarchy={identity.type_hierarchy}/>
                </tbody>);
              } else {
                return (<tbody key={base64Object(item)} className="base--tbody">
                <AgeScoreRow key={base64Object(age)} min={age.min} max={age.max} score={age.score.toFixed(2)}/>
                <GenderScoreRow key={base64Object(gender)} gender={gender.gender} score={gender.score.toFixed(2)}/>
                </tbody>);
              }

            })}
            {this.props.items.filter(function(item) { return item.type_hierarchy; }).map(function(item) {
              return (<IdentityTypeHiearchy key={item.type_hierarchy} type_hierarchy={item.type_hierarchy}/>);
            })}
            <tbody className="base--tbody">
            <WowForm name={this.props.category}/>
            </tbody>
          </table>
        </div>
    );
  }
}

class WordsScoreTable extends React.Component {
  render() {
    return (
        <div className="results-table--container">
          <div className="beta-tag">Private Beta</div>
          <div>Standard Plan members can contact shantenu.agarwal@us.ibm.com to <br />request Private Beta access.</div>
          <JsonLink rawjson={this.props.rawjson}/>
          <table className="base--table results-table">
            <ScoreTableHeader title={this.props.category}/>
            <tbody className="base--tbody">
            {this.props.items.map(function(item) {
              return (<ClassifyScoreRow key={item.word+item.score.toFixed(3)} name={item.word} score={item.score.toFixed(2)}/>);
            })}
            </tbody>
            <tbody className="base--tbody">
            <WowForm name={this.props.category}/>
            </tbody>
          </table>
        </div>
    );
  }
}

class ResultsTable extends React.Component {
  render() {
    return (<div className="use--output-data">
          <ClassifyScoreTable category="Classes" rawjson={this.props.classJson} items={this.props.classItems} foodCount={this.props.foodItems.length} faceCount={this.props.faceItems.length}  wordCount={this.props.wordsItems.length}/>
          { this.props.foodItems.length ? <FoodScoreTable category="Food" rawjson={this.props.foodJson} items={this.props.foodItems}/> : <div style={{display: 'none'}}></div>}
          { this.props.faceItems.length ? <FaceScoreTable category="Faces" rawjson={this.props.faceJson} items={this.props.faceItems}/> : <div style={{display: 'none'}}></div>}
          { this.props.wordsItems.length ? <WordsScoreTable category="Text" rawjson={this.props.wordsJson} items={this.props.wordsItems}/> : <div style={{display: 'none'}}></div>}
        </div>
    );
  }
}

class CustomResultsTable extends React.Component {
  render() {
    return (<div className="use--output-data">
          <CustomClassifyScoreTable category="Classes" rawjson={this.props.classJson} items={this.props.classItems}/>
        </div>
    );
  }
}

export default ClassifyScoreTable;

export function classifyScoreTable(results, tagid) {

  let target = typeof(tagid) === 'string' ? document.getElementById(tagid) : tagid;
  let tags = jpath.jpath('/images/0/classifiers/0/classes',results,[]);
  let food = jpath.jpath('/images/0/classifiers/1/classes',results,[]);
  let tagsJ =  jpath.jpath('/images/0/classifiers/0', results) // Json for tags
  let foodJ = jpath.jpath('/images/0/classifiers/1', results);
  if (tagsJ.classifier_id === 'food') {
    tagsJ =  jpath.jpath('/images/0/classifiers/1', results);
    foodJ = jpath.jpath('/images/0/classifiers/0', results);
    tags = jpath.jpath('/images/0/classifiers/1/classes',results,[]);
    food = jpath.jpath('/images/0/classifiers/0/classes',results,[]);
  }
  if (foodJ.classes[0].class === 'non-food' && foodJ.classes.length === 1) {
    food = [];
    foodJ = [];
  }
  let faces = jpath.jpath('/images/0/faces',results,[]);
  let words = jpath.jpath('/images/0/words',results, []);
  if (target) {

    ReactDom.render(<ResultsTable classJson={tagsJ} classItems={tags}
                                  foodJson={foodJ} foodItems={food}
                                  faceJson={faces} faceItems={faces}
                                  wordsJson={words} wordsItems={words}/>, target);
  }
}

export function customClassifyScoreTable(results, tagid) {
  let target = typeof(tagid) === 'string' ? document.getElementById(tagid) : tagid;
  let tags = jpath.jpath('/images/0/classifiers/0/classes',results,[]);
  if (target) {
    ReactDom.render(<CustomResultsTable classJson={jpath.jpath('/images/0/classifiers', results)}
                                        classItems={tags}/>, target);
  }
}
