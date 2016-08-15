import React from 'react';
import ReactDom from 'react-dom';

class BoxLocation extends React.Component {
  styleInfo() {
    return  {height: this.props.height + 'px',
               left: this.props.left + 'px',
               top: this.props.top + 'px',
               width: this.props.width + 'px' };
  }
  render() {
    return (<div className="box-location" style={this.styleInfo()}></div>);
  }
}

class Boxes extends React.Component {
  render() {
    return (<div className=".boxes">
      {this.props.boxdata.map(function(item) {
        return <BoxLocation key={Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)} height={item.height} width={item.width} left={item.left} top={item.top}/>
      })}
        </div>
    );
  }
}

export default Boxes;

export function renderBoxes(tagid, boxdata) {
  let element = document.getElementById(tagid);
  if (element) {
    ReactDom.render(<Boxes boxdata={boxdata}/>,document.getElementById(tagid));
  }
}