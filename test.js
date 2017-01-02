
const fs = require('fs'),
  path = require('path'),
  yaml = require('js-yaml'),
  raccoon = require('raccoon');

const files = fs.readdirSync(path.join(__dirname, '/ml-100k/'));

const getYamlDoc = function(name){
  try {
    var doc = yaml.safeLoad(fs.readFileSync(path.join(__dirname, `/ml-100k/yaml/${name}`), 'utf8'));
    return doc;
  } catch (e) {
    console.log(e);
  }  
}

const baseData = getYamlDoc('u1.base.yaml');

const createRating = function(line) {
  const [user, movie, rating] = line;
  const ratingFunc = rating > 3 ? raccoon.liked : raccoon.disliked;
  return ratingFunc(user, movie, {updateRecs: false});
}

var actions = baseData.map(createRating); // run the function over all items.

// we now have a promises array and we want to wait for it

var results = Promise.all(actions); // pass array of promises

results.then(data =>
    console.log('data', data)
);

// start clock
// get recommendations for all
// predict recommendations for test data
// end close
// compare predictions to actual results
