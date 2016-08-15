let classifierNameMapping = {};
classifierNameMapping.dogs = new Set(['goldenretriever', 'husky', 'dalmatian', 'beagle']);
classifierNameMapping.insurance = new Set(['brokenwinshield', 'flattire','motorcycleaccident','vandalism']);
classifierNameMapping.moleskine = new Set(['journaling','landscape','notebook','portrait']);
classifierNameMapping.omniearth = new Set(['baseball','cars','golf','tennis']);

/**
 * this function takes a list of class names and a dictionary of
 * sets of known bundle classes and finds the highest scoring match
 * for list.  If the score is less than the threshold, then it is discarded.
 * Most often, the dictionary of sets will be `classifierNameMapping
 * which is generated from the bundles we provide.
 * @param threshold
 * @param list_of_classes
 * @param class_sets_dictionary
 * @returns {null or string}
 */

export function membership(threshold, list_of_classes, class_sets_dictionary) {

  let source = class_sets_dictionary || classifierNameMapping;

  let best_candidate = Object.keys(source).map(x => {
    let count = list_of_classes.reduce((k, c) => { return source[x].has(c) ? k + 1 : k},0);
    let x_len = source[x].size;
    return [x, count/x_len];
  }).reduce((k,v) => { return k[1] < v[1] ? v : k});

  return best_candidate[1] >= threshold ? best_candidate[0] : null;
}

export function missingClasses(list_of_classes, target_classes_set) {
  let loc = new Set(list_of_classes);
  let source = target_classes_set || classifierNameMapping;
  return [...source].filter(x => !loc.has(x));
}

export function allMissingClasses(list_of_classes) {
  let bundlename = membership(0.5,list_of_classes);
  if (bundlename) {
    let missing = missingClasses(list_of_classes, classifierNameMapping[bundlename])
    return missing;
  } else {
    return [];
  }
}
/**
 *
 * @param classname
 * @returns {null or a path to a zipfile}
 */
export function bundleZipfileForClass(classname) {
  let bundle = membership(0,[classname])
  return bundle ? [bundle, classname].join("/") + ".zip" : null;
}