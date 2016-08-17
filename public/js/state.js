import {parse, stringify} from 'querystring';

export function getState() {
  // substring(1) to drop the '?'
  return parse(location.search.substring(1));
}

export function setState(state) {
  const encoded = stringify(state);
  try {
    history.pushState(state, state.name || "", '?' + encoded)
  } catch(ex) {
    location.search = encoded;
  }
}

export function reset() {
  setState({});
}

// export function updateState(changes) {
//   setState(Object.assign(getState(), changes));
// }
//


window.onpopstate = function(/*event*/) {
  // this is dumb but it makes the back button work
  // (without having to restructure the app)
  location.reload();
};
