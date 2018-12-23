'use strict';

// const dataset = require('..');

const { Matrix } = require('ml');

// const createDataset = require('../createDataset.js');
const createDataClasses = require('../createDataClasses.js');
const shuffle = require('../utils/shuffle.js');

let iris = require('./data/iris.js');

// let metadata = iris.map((d) => d[4]);
// let permutations = metadata.slice(0).shuffle; // to clone before shuffling
// console.log(metadata)
// console.log(permutations)
// iris = iris.map((d) => d.slice(0, 4));
// let dataArray = new Matrix(150, 4);
// iris.forEach((e, i) => dataArray.setRow(i, iris[i]));
// let dataClass = createDataClass('species',
//   metadata).addClass('permutation', permutations).getClass();

// let ds = createDataset({ dataMatrix: dataArray, options: {
//   description: 'iris dataset',
//   dataClass: dataClass,
//   metadata: metadata
// }
// });
// ds.summary(1);


describe('createDataClasses tests', () => {
  let metadata = iris.map((d) => d[4]);
  let dataClass = createDataClasses('species',
    metadata);
  let testClass = dataClass.summary(1);

  it('test summary', () => {
    expect(testClass.dataClasses[0].value).toHaveLength(150);
    expect(testClass.nObs).toEqual(150);
    expect(testClass.nClass).toEqual(1);
    expect(testClass.dataClasses[0].value).toMatchSnapshot();
    expect(testClass.dataClasses[0].value[0]).toEqual('setosa');
    expect(testClass.dataClasses).toHaveLength(2); // should be 1!
  });

  let nObs = testClass.nObs;
  let index = [];
  for (let i = 0; i < nObs; i++) {
    index.push(i + 1);
  }
  dataClass.addDataClass('index', index);

  it('test addDataClasses', () => {
    expect(dataClass.summary(1).dataClasses.map((x) => x.title)).toHaveLength(2);
    expect(dataClass.summary().nClass).toEqual(2);
    expect(dataClass.summary().dataClasses[1].value[0]).toEqual(1);
  });

  it('test getDataClasses', () => {
    expect(dataClass.getDataClasses([0])[0].classVector).toHaveLength(150);
    expect(dataClass.getDataClasses([1])[0].classVector).toHaveLength(150);
    expect(dataClass.getDataClasses()[0].classVector).toHaveLength(150);
    expect(dataClass.getDataClasses()[1].classVector).toHaveLength(150);
  });

  it('test getPermutedClasses', () => {
    expect(dataClass.getPermutedClasses([0])[0].classVector).toHaveLength(150);
    expect(dataClass.getPermutedClasses()[0].classVector).toHaveLength(150);
  });

  let counts = {};
  dataClass.getDataClasses([0])[0].classVector.forEach((x) => counts[x] = (counts[x] || 0) + 1);
  // console.log(counts);
  it('test counts class items', () => {
    expect(counts.setosa).toEqual(50);
  });

  let permutedCounts = {};
  dataClass.getPermutedClasses([0])[0].classVector.forEach((x) => permutedCounts[x] = (permutedCounts[x] || 0) + 1);
  // console.log(permutedCounts);
  it('test counts permuted class items', () => {
    expect(permutedCounts.setosa).toEqual(50);
  });

  let newClass = dataClass.filterObservationsByIndex([0, 1, 2, 12, 13, 100, 101, 102, 103, 130]);
  // console.log(newClass.summary(1));
  it('test filterObservationsByIndex', () => {
    expect(newClass.summary(1).dataClasses.map((x) => x.title)).toHaveLength(2);
    expect(newClass.getDataClasses([0])[0].classVector).toHaveLength(140);
    expect(newClass.getDataClasses([1])[0].classVector).toHaveLength(140);
    expect(newClass.getDataClasses()[0].classVector).toHaveLength(140);
    expect(newClass.getDataClasses()[1].classVector).toHaveLength(140);
  });

  let sampleIndex = newClass.sampleByClasses([0], 0.2);
  let labels = newClass.getDataClasses([0])[0].classVector;
  let res = [];
  sampleIndex.forEach((v) => res.push(labels[v]));
  let sampleCounts = {};
  res.forEach((x) => sampleCounts[x] = (sampleCounts[x] || 0) + 1);

  it('test sampleByClasses', () => {
    expect(sampleCounts.setosa).toEqual(9);
    expect(sampleCounts.versicolor).toEqual(10);
    expect(sampleCounts.virginica).toEqual(9);
  });
});
