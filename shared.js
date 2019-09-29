const fs = require('fs');
const util = require('util');
const promisifiedWriteFile = util.promisify(fs.writeFile);
const lineByLine = require('n-readlines');

const getPointsFromFile = (path) => {
  let points = [];
  const liner = new lineByLine(path);
  while (line = liner.next()) {
    line = line.toString().split(' ');
    let point = [parseFloat(line[0]), parseFloat(line[1])];
    if (!isNaN(point[0]) && !isNaN(point[1])) {
      points.push(point);
    }
  }
  return points;
}

const writeFileAsync = (fileName, data) => {
  return promisifiedWriteFile(fileName, JSON.stringify(data));
}

const getCachedDistance = (() => {
  let cache = {};
  return function (p1, p2) {
    let keyOne = `${p1[0]},${p1[1]},${p2[0]},${p2[1]}`;
    let keyTwo = `${p2[0]},${p2[1]},${p1[0]},${p1[1]}`;
    if (cache.hasOwnProperty(keyOne)) {
      return cache[keyOne];
    } else if (cache.hasOwnProperty(keyTwo)) {
      return cache[keyTwo];
    } else {
      cache[keyOne] = Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
      return cache[keyOne];
    }
  }
})();

const calculateDistance = (points) => {
  let distance = 0;
  for (let i = 0; i < points.length; i++) {
    let p1 = points[i];
    let p2 = i === points.length - 1 ? points[0] : points[i + 1];
    distance += getCachedDistance(p1, p2);
  }
  return distance;
}

module.exports = {
  getPointsFromFile,
  writeFileAsync,
  calculateDistance
}
