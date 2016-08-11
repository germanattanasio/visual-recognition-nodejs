export function lookupName(name) {
  return { goldenretriever: 'Golden Retriever',
        husky: 'Husky',
        dalmatian: 'Dalmatian',
        beagle: 'Beagle',
        brokenwinshield: 'Broken Windshield',
        flattire: 'Flat Tire',
        motorcycleaccident: 'Motorcycle Involved',
        vandalism: 'Vandalism',
        journaling: 'Journaling',
        landscape: 'Landscape',
        notebook: 'Notebook',
        portrait: 'Portrait',
        baseball: 'Baseball',
        cars: 'Cars',
        golf: 'Golf',
        tennis: 'Tennis'}[name] || name;
}