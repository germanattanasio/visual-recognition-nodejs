import {parse, stringify} from 'querystring';

export function getState() {
  try {
    // substring(1) to drop the '?'
    return JSON.parse(parse(location.search.substring(1)).state);
  } catch(ex) {
    return {};
  }
}

// todo: use pushState once this works smoothly
// todo: consider stringifying only objects and leaving everything ese top-level (or updating code to not need objects ;)
export function setState(state) {
  location.search = stringify({
    state: JSON.stringify(state)
  });
}

// export function updateState(changes) {
//   setState(Object.assign(getState(), changes));
// }
//
