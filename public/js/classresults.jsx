import React from 'react';
import ReactDom from 'react-dom';

class WowForm extends React.Component {
  constructor() {
    super();
    this.state = {
      selected: false,
      item: null
    };
  }
  handleClick(item) {
    this.setState({selected: this.selected, item: item});
  }
  render() {
    return (<tr className="base--tr">
      <td colSpan="3" className="base--td results-table--feedback">
        <em className="base--em">{ this.props.title ? this.props.title : 'Did we wow you?'}</em>
        <span className="results-table--feedback-inputs">
                <input type='hidden' name='category' value={this.props.category}/>
                <input role="radio" onClick={this.handleClick.bind(this,'yes')} type="radio" id={this.props.name + '-yes'} name={this.props.name + '-group'} value='yes' className="base--radio results-table--input-yes" checked={this.state.item == 'yes'}/>
                <label htmlFor={this.props.name +'-yes'} className="base--inline-label results-table--input-yes-label">Yes</label>
                <input role="radio" onClick={this.handleClick.bind(this,'no')} type="radio" id={this.props.name + '-no'} name={this.props.name + '-group'} value="no" className="base--radio results-table--input-no" checked={this.state.item == 'no'}/>
                <label htmlFor={this.props.name + '-no'} className="base--inline-label results-table--input-no-label">No</label>
              </span>
      </td>
    </tr>);
  }}

class TypeHierarchy extends React.Component {
  filtered() {
    return this.props.type_hierarchy;
  }
  render() {
    return (<tr className="base--tr">
      <td colSpan="3" className="base--td">{this.filtered()}</td>
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
    window.open('data:application/json,' + encodeURIComponent(JSON.stringify(this.props.rawjson, null, 1)), '_blank');
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
      <th className="base--th results-table--header" colSpan='2'>Score</th>
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
    return (<tr>
      <td className="result--class">{this.props.name}</td>
      <td className="result--score">
        <div className={this.scoreColor()}>{this.props.score}</div></td>
      <td className="result--thermometer">
        <img src={"http://visual-recognition-demo.mybluemix.net/thermometer?score=" + this.props.score}/></td>
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
    return (<tr>
      <td className="result--class">age {this.props.min} - {this.props.max}</td>
      <td className="result--score">
        <div className={this.scoreColor()}>{this.props.score}</div></td>
      <td className="result--thermometer">
        <img src={"http://visual-recognition-demo.mybluemix.net/thermometer?score=" + this.props.score}/></td>
    </tr>);
  }
}

class IdentityTypeHiearchy extends TypeHierarchy {
  filtered() {
    var results = this.props.type_heirarchy;
    if (results) {
      results = results.replace(/^\/|\/$/g, ''); // trim first / and last /
      results = results.replace(/\//g, ' > ');  // change slashes to >'s
    }
    return results;
  }
}

class ClassifyScoreTable extends React.Component {
  render() {
    if (this.props.items.length == 0) {
      return (<div>No Items Found</div>);
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
            {this.props.items.filter(function(item) { return item.type_hierarchy; }).map(function(item) {
              return (<IdentityTypeHiearchy key={item.type_hierarchy} type_hierarchy={item.type_hierarchy}/>);
            })}
            <WowForm name='class'/>
            </tbody>
          </table>
        </div>
    );
  }
}

export default ClassifyScoreTable;

export function classifyScoreTable(rawjson, itemsjson, category, tagid) {
  let target = typeof(tagid) === 'string' ? document.getElementById(tagid) : tagid;
  ReactDom.render(<ClassifyScoreTable category={category} rawjson={rawjson} items={itemsjson}/>, target);
}

