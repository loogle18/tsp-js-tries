const hrStart = process.hrtime();
const {
  getPointsFromFile,
  writeFileAsync,
  calculateDistance
} = require('./shared');

const getPermutations = function* (list) {
  if (list.length === 1) {
    yield list;
  } else {
    let [first, ...rest] = list;
    for (let perm of getPermutations(rest)) {
      for (let i = 0; i < list.length; i++) {
        let start = perm.slice(0, i);
        let rest = perm.slice(i);
        yield [...start, first, ...rest];
      }
    }
  }
}

const main = async () => {
  let points = getPointsFromFile('points.txt');
  let route = points;
  let initialDistance = calculateDistance(points);
  let bestDistance = initialDistance;
  if (points.length > 3) {
    for (let pointsVariant of getPermutations(points)) {
      let distance = calculateDistance(pointsVariant);
      if (!bestDistance || distance < bestDistance) {
        bestDistance = distance;
        route = pointsVariant;
      }
    }
  }
  let hrTime = process.hrtime(hrStart);
  let timeInMs = parseInt(((hrTime[0] * 1e3) + (hrTime[1]) * 1e-6));
  return writeFileAsync(
    'result-bf.json',
    {
      initialDistance,
      bestDistance,
      route,
      timeInMs
    }
  );
}

main().then(() => {
  console.log('Done')
}).catch((err) => {
  console.log('Something went wrong...');
  console.log(err.message);
});
