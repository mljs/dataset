'use strict';

// const dataset = require('..');

const { Matrix } = require('ml');

const createDataset = require('../createDataset.js');
const createDataClasses = require('../createDataClasses.js');

let iris = require('./data/iris.js');

let irisDataset;

describe('creation of datasets', () => {
  // build dataClasses
  let metadata = iris.map((d) => d[4]);
  let dataClass = createDataClasses('species',
    metadata);

  // build dataMatrix
  let dataArray = new Matrix(150, 4);
  let arrr = iris.map((d) => d.slice(0, 4));
  arrr.forEach((e, i) => dataArray.setRow(i, arrr[i]));

  it('should create without class', () => {
    // create dataset
    irisDataset = createDataset({
      dataMatrix: dataArray, options: {
        description: 'iris dataset'
      }
    });
    expect(irisDataset.summary(1).nObs).toEqual(150);
  });

  it('should create with class', () => {
    // create dataset
    irisDataset = createDataset({
      dataMatrix: dataArray, options: {
        description: 'iris dataset',
        dataClass: dataClass
      }
    });
    expect(irisDataset.summary(1).nObs).toEqual(150);
    expect(irisDataset.getClass()[0].classFactor).toHaveLength(150);
  });

  it('should create with metadata', () => {
    // create dataset
    irisDataset = createDataset({
      dataMatrix: dataArray, options: {
        description: 'iris dataset',
        dataClass: dataClass,
        metadata: metadata
      }
    });
    expect(irisDataset.summary(1).nObs).toEqual(150);
    expect(irisDataset.getClass()[0].classFactor).toHaveLength(150);
    expect(irisDataset.summary().metadata).toHaveLength(150);
  });
});
