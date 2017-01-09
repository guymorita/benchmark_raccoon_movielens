
const fs = require('fs'),
  path = require('path'),
  yaml = require('js-yaml'),
  raccoon = require('raccoon'),
  client = require('./lib/client'),
  config = require('./lib/config'),
  now = require("performance-now");

require('heapdump');

const generateHeapDumpAndStats = function(){
  //1. Force garbage collection every time this function is called
  try {
    global.gc();
  } catch (e) {
    console.log("You must run program with 'node --expose-gc index.js' or 'npm start'");
    process.exit();
  }

  //2. Output Heap stats
  var heapUsed = process.memoryUsage().heapUsed;
  console.log("Program is using " + heapUsed + " bytes of Heap.")

  //3. Get Heap dump
  process.kill(process.pid, 'SIGUSR2');
}

// generateHeapDumpAndStats();

// setInterval(generateHeapDumpAndStats, 2000); //Do garbage collection and heap dump every 2 seconds

const NUM_USERS_TO_TEST = config.numUsersToTest;
const EQUILIBRIUM = 0.0;

let start, stop;

const files = fs.readdirSync(path.join(__dirname, '/ml-100k/'));

const getYamlDoc = function(name){
  try {
    var doc = yaml.safeLoad(fs.readFileSync(path.join(__dirname, `/ml-100k/yaml/${name}`), 'utf8'));
    return doc;
  } catch (e) {
    console.log(e);
  }  
}

const baseData = getYamlDoc(config.baseDataPool);
const testData = getYamlDoc(config.testDataPool);
const userIds = Array.from(Array(NUM_USERS_TO_TEST).keys()).map((x)=> { return x + 1;});

const createRating = function(line) {
  const [user, movie, rating] = line;
  const ratingFunc = rating > 3 ? raccoon.liked : raccoon.disliked;
  return ratingFunc(user, movie, {updateRecs: false});
};

const updateRec = function(userId) {
  return raccoon.updateSequence(userId, 1, {updateWilson: false}).then(() => {
    return Promise.resolve();
  });
};

const predictCompare = function(line) {
  const [user, movie, rating] = line;
  return raccoon.predictFor(user, movie).then((prediction) => {
    return [user, Number(rating), prediction];
  });
};

start = now()
client.flushdbAsync().then(() => {
  const ratingActions = baseData.map(createRating);

  const ratingResults = Promise.all(ratingActions);
  console.log('--- finished inputing ratings ---');
  return ratingResults;
}).then((data) => {
  const updateActions = userIds.map(updateRec);

  const recResults = Promise.all(updateActions);
  console.log('--- finished updating similarities ---');
  return recResults;
}).then((recResults) => {
  const predictActions = testData.map(predictCompare);

  const predictResults = Promise.all(predictActions);
  console.log('--- finished making predictions ---');
  return predictResults;
}).then((predictResults) => {
  end = now()
  const totalTime = (end-start).toFixed(3)/1000;
  let correctCount = 0;
  let incorrectCount = 0;
  let ratedCount = 0;
  let unratedCount = 0;
  let totalCount = 0;
  let highGuess = 0;
  let sqErrorSum = 0;

  for (i in predictResults) {
    const [user, rating, prediction] = predictResults[i];
    const polarPrediction = prediction > 0 ? 1 : 0;
    const polarRating = rating > 3 ? 1 : 0;
    const residualError = polarRating - polarPrediction;

    if (user > NUM_USERS_TO_TEST) {
      continue;
    }

    const sqError = Math.pow(residualError, 2);
    sqErrorSum += sqError;
    totalCount += 1;

    if (prediction === 0) {
      unratedCount += 1;
    } else if (prediction > EQUILIBRIUM && rating > 3) {
      correctCount += 1;
      ratedCount += 1;
    } else if (prediction < EQUILIBRIUM && rating <= 3) {
      correctCount += 1;
      ratedCount += 1;
    } else {
      if (prediction > EQUILIBRIUM) {
        highGuess += 1;
      }
      incorrectCount += 1;
      ratedCount += 1;
    }
  }
  const RMSE = Math.sqrt(sqErrorSum / totalCount);

  const finalScore = (correctCount / ratedCount).toFixed(4);
  const unratedPerc = (unratedCount / totalCount).toFixed(4);
  const highGuessPerc = (highGuess / incorrectCount).toFixed(4);

  console.log(`Compared ${NUM_USERS_TO_TEST} users`);
  console.log(`RMSE = ${RMSE}`);
  console.log(`Prediction Accuracy: ${finalScore}% -- ${correctCount} out of ${ratedCount} correct`);
  console.log(`Unrated: ${unratedPerc}% -- ${unratedCount} out of ${totalCount} total`);
  console.log(`Guessed high: ${highGuessPerc}% -- ${highGuess} high out of ${incorrectCount} wrong`);
  console.log(`Total time: ${totalTime.toFixed(2)} seconds`);
  console.log('--- test complete ---');
  process.exit();
});
