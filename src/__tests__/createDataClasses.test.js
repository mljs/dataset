'use strict';

const createDataClasses = require('../createDataClasses.js');

let iris = require('./data/iris.js');

describe('creation of dataClasses', () => {
  it('should display a summary', () => {
    let metadata = iris.map((d) => d[4]);
    let dataClass = createDataClasses('species',
      metadata);
    let testClass = dataClass.summary();
    expect(testClass.dataClasses[0].value).toHaveLength(150);
    expect(testClass.dataClasses).toHaveLength(1);
    expect(testClass.nObs).toEqual(150);
    expect(testClass.nClass).toEqual(1);
    expect(testClass.dataClasses[0].value).toMatchSnapshot();
    expect(testClass.dataClasses[0].value[0]).toEqual('setosa');
  });

  it('should add a class', () => {
    let metadata = iris.map((d) => d[4]);
    let dataClass = createDataClasses('species',
      metadata);
    let nObs = dataClass.summary(1).nObs;
    let index = [];
    for (let i = 0; i < nObs; i++) {
      index.push(i + 1);
    }
    dataClass.addDataClass('index', index);
    expect(dataClass.summary(1).dataClasses).toHaveLength(2);
    expect(dataClass.summary().nClass).toEqual(2);
    expect(dataClass.summary().dataClasses[1].value[0]).toEqual(1);
  });

  it('should return dataClass in different formats', () => {
    let metadata = iris.map((d) => d[4]);
    let dataClass = createDataClasses('species',
      metadata);
    let nObs = dataClass.summary(1).nObs;
    let index = [];
    for (let i = 0; i < nObs; i++) {
      index.push(i + 1);
    }
    dataClass.addDataClass('index', index);
    expect(dataClass.getDataClasses([0])[0].classVector).toHaveLength(150);
    expect(dataClass.getDataClasses([0])[0].classFactor).toHaveLength(150);
    expect(typeof (dataClass.getDataClasses([0])[0].classFactor[0])).toEqual('number');
    expect(dataClass.getDataClasses([0])[0].classMatrix).toHaveLength(150);
    expect(typeof (dataClass.getDataClasses([0])[0].classMatrix)).toEqual('object');
    expect(dataClass.getDataClasses([0])[0].classMatrix.rows).toEqual(150);
    expect(dataClass.getDataClasses([1])[0].classVector).toHaveLength(150);
    expect(dataClass.getDataClasses()[0].classFactor).toHaveLength(150);
    expect(dataClass.getDataClasses()[1].classMatrix).toHaveLength(150);
  });

  it('should return permuted dataClasses', () => {
    let metadata = iris.map((d) => d[4]);
    let dataClass = createDataClasses('species',
      metadata);
    expect(dataClass.getPermutedClasses([0])[0].classVector).toHaveLength(150);
    expect(dataClass.getPermutedClasses()[0].classVector).toHaveLength(150);
    expect(dataClass.getPermutedClasses()[0].classFactor.reduce((a, c) => a + c)).toEqual(150);
    expect(dataClass.getPermutedClasses()[0].classVector).not.toBe(dataClass.getDataClasses()[0].classVector);
  });

  it('should not alterate the population', () => {
    let metadata = iris.map((d) => d[4]);
    let dataClass = createDataClasses('species',
      metadata);
    let counts = {};
    dataClass.getDataClasses([0])[0].classVector.forEach((x) => {
      counts[x] = (counts[x] || 0) + 1;
      return counts;
    });
    expect(counts.setosa).toEqual(50);
  });

  it('should not alterate the population of permuted populations', () => {
    let metadata = iris.map((d) => d[4]);
    let dataClass = createDataClasses('species',
      metadata);
    let permutedCounts = {};
    dataClass.getPermutedClasses([0])[0].classVector.forEach((x) => {
      permutedCounts[x] = (permutedCounts[x] || 0) + 1;
      return permutedCounts;
    });
    expect(permutedCounts.setosa).toEqual(50);
  });

  it('should return a smaller set without some observations', () => {
    let metadata = iris.map((d) => d[4]);
    let dataClass = createDataClasses('species',
      metadata);
    let nObs = dataClass.summary(1).nObs;
    let index = [];
    for (let i = 0; i < nObs; i++) {
      index.push(i + 1);
    }
    dataClass.addDataClass('index', index);
    let newClass = dataClass.filterObservationsByIndex([0, 1, 2, 12, 13, 100, 101, 102, 103, 130]);
    expect(newClass.summary(1).dataClasses.map((x) => x.title)).toHaveLength(2);
    expect(newClass.getDataClasses([0])[0].classVector).toHaveLength(140);
    expect(newClass.getDataClasses([1])[0].classVector).toHaveLength(140);
    expect(newClass.getDataClasses()[0].classVector).toHaveLength(140);
    expect(newClass.getDataClasses()[1].classVector).toHaveLength(140);
  });

  it('should return sampleByClasses with balanced populations', () => {
    let metadata = iris.map((d) => d[4]);
    let dataClass = createDataClasses('species',
      metadata);
    let newClass = dataClass.filterObservationsByIndex([0, 1, 2, 12, 13, 100, 101, 102, 103, 130]);
    let sampleIndex = newClass.sampleByClasses([0], 0.2);
    let labels = newClass.getDataClasses([0])[0].classVector;
    let res = [];
    sampleIndex.forEach((v) => res.push(labels[v]));
    let sampleCounts = {};
    res.forEach((x) => {
      sampleCounts[x] = (sampleCounts[x] || 0) + 1;
      return sampleCounts;
    });
    expect(sampleCounts.setosa).toEqual(9);
    expect(sampleCounts.versicolor).toEqual(10);
    expect(sampleCounts.virginica).toEqual(9);
  });
});
