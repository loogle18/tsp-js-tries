const hrStart = process.hrtime();
const {
  getPointsFromFile,
  writeFileAsync,
  calculateDistance
} = require('./shared');

const {
  GENERATION_AMOUNT = 800,
  POPUlATION_AMOUNT = 80,
  MUTATION_RATE = 0.05 // 5%
} = process.env;

const swap = (list, indexOne, indexTwo) => {
  [list[indexOne], list[indexTwo]] = [list[indexTwo], list[indexOne]];
}

const random = (min, max, floor = true) => {
  let rand = Math.random() * (max - min);
  return (floor ? Math.floor(rand) : rand) + min;
}

const range = (start, end) => {
  let result = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
}

const shuffle = (list) => {
  let listCopy = [...list];
  let newList = [];
  let listLength = list.length;
  let index;
  while (listLength) {
    index = random(0, listLength--);
    newList.push(listCopy.splice(index, 1)[0]);
  }
  return newList;
}

const mutate = (list, rate) => {
  let listLength = list.length;
  for (let i = 0; i < listLength; i++) {
    if (Math.random(1) < rate) {
      let indexOne = random(0, listLength);
      let indexTwo = (indexOne + 1) % listLength;
      swap(list, indexOne, indexTwo);
    }
  }
}

const getInitialPopulation = (list, amount) => {
  let population = [];
  while (amount--) {
    population.push(shuffle(list));
  }
  return population;
}

const getFitnessAndBestEver = (population) => {
  let fitness = [];
  let bestEver = { distance: Infinity, route: null };
  for (let i = 0; i < population.length; i++) {
    let distance = calculateDistance(population[i]);
    if (distance < bestEver.distance) {
      bestEver = { distance, route: population[i] };
    }
    fitness[i] = 1 / (Math.pow(distance, 10) + 1);
  }
  return { fitness, bestEver };
}

const getNormalizedFitness = (fitness) => {
  let normalizedFitness = [...fitness];
  let sum = normalizedFitness.reduce((a, b) => a + b, 0);
  for (let i = 0; i < normalizedFitness.length; i++) {
    normalizedFitness[i] /= sum;
  }
  return normalizedFitness;
}

const pickOneFromPopulation = (population, fitness) => {
  let index = 0;
  let rand = random(0, 1, false);
  while (rand > 0) {
    rand = rand - fitness[index++];
  }
  return population[--index];
}

const getNextGeneration = (population, fitness) => {
  let newPopulation = [];
  for (let i = 0; i < population.length; i++) {
    let first = [...pickOneFromPopulation(population, fitness)];
    let second = [...pickOneFromPopulation(population, fitness)];
    let route = getCrossover(first, second);
    mutate(route, MUTATION_RATE)
    newPopulation[i] = route;
  }
  return newPopulation
}

const getCrossover = (first, second) => {
  let listLength = first.length;
  let start = random(0, listLength - 1);
  let end = random(start + 1, listLength);
  let newRoute = Array(listLength);
  let rangeOfIndices = range(start, end);
  for (let i of rangeOfIndices) {
    newRoute[i] = first[i];
  }
  let leftover = listLength - rangeOfIndices.length;
  let i = 0;
  while (leftover) {
    let point = second[i];
    if (!newRoute.includes(point)) {
      for (let j = 0; j < listLength; j++) {
        if (!newRoute[j]) {
          newRoute[j] = point;
          break;
        }
      }
      leftover--;
    }
    i++;
  }
  return newRoute;
}

const main = async (generationAmount) => {
  let points = getPointsFromFile('points.txt');
  let route = points;
  let initialDistance = calculateDistance(points);
  let bestFoundDistance = initialDistance;
  if (points.length > 3) {
    let population = getInitialPopulation(route, POPUlATION_AMOUNT);
    while (generationAmount--) {
      let { fitness, bestEver } = getFitnessAndBestEver(population);
      fitness = getNormalizedFitness(fitness);
      if (bestEver.distance < bestFoundDistance) {
        bestFoundDistance = bestEver.distance;
        route = bestEver.route;
      }
      population = getNextGeneration(population, fitness);
    }
  }
  let hrTime = process.hrtime(hrStart);
  let timeInMs = parseInt(((hrTime[0] * 1e3) + (hrTime[1]) * 1e-6));
  return writeFileAsync(
    'result-ga.json',
    {
      initialDistance,
      bestFoundDistance,
      route,
      timeInMs
    }
  );
}

main(GENERATION_AMOUNT).then(() => {
  console.log('Done')
}).catch((err) => {
  console.log('Something went wrong...');
  console.log(err.message);
});
