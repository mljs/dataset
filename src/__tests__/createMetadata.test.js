'use strict';

// const dataset = require('..');

const { Matrix } = require('ml');

const createDataset = require('../createMetadata.js');

let iris = require('./data/iris.js');
// let coffee = require('./data/coffee.js');

describe('creation of metadata', () => {
  // build metadata
  let metadata = createMetadata(iris.map((d) => d[4]));

  it('should create for single column', () => {
    expect(metadata.summary(1).nObs).toEqual(150);
    expect(metadata.summary(1).nMetadata).toEqual(1);
  });

  it('should create for multiple column', () => {
    expect(metadata.summary(1).nObs).toEqual(150);
    expect(metadata.summary(1).nMetadata).not.toEqual(1);
  });

  it('should get row x', () => {
    expect(metadata.summary(1).nObs).toEqual(150);
    expect(metadata.summary(1).nMetadata).toEqual(1);
  });

  it('should get metadata for observation x', () => {
    expect(metadata.summary(1).nObs).toEqual(150);
    expect(metadata.summary(1).nMetadata).toEqual(1);
  });
});

