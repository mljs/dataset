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

  it('should init', () => {
    let description = 'coffee dataset';
    let dataset = createDataset(description);
    expect(dataset).toBeDefined();
  });

  it('should be possible to get a summary', () => {
    let description = 'coffee dataset';
    let dataset = createDataset(description);
    expect(dataset.summary()).toEqual({ description: 'coffee dataset' });
  });

  it('should be possible to push a dataBlock', () => {
    let description = 'nmr block';
    let dataMatrix = Matrix();
    dataset.pushDataBlock(description, dataMatrix);
    expect(dataset.summary().dataBlock).toHaveLength(1);
    expect(dataset.summary().dataBlock[0].description).toEqual('nmr block');
    expect(typeof(dataset.summary().dataBlock[0].value).toEqual('matrix');
    expect(dataset.summary().dataBlock[0].value.rows).toEqual(34);
    expect(dataset.summary().dataBlock[0].value.columns).toEqual(1610);
  });

  it('should be possible to push a dataBlock from an array', () => {
    let description = 'ms block';
    let dataArray = Matrix();
    dataset.pushDataBlockFromArray(description, dataArray);
    expect(dataset.summary().dataBlock).toHaveLength(2);
    expect(dataset.summary().dataBlock[0].description).toEqual('ms block');
    expect(typeof(dataset.summary().dataBlock[0].value).toEqual('matrix');
    expect(dataset.summary().dataBlock[0].value.rows).toEqual(34);
    expect(dataset.summary().dataBlock[0].value.columns).toEqual(7);
  });

  it('should be possible to get dataBlocks', () => {
    let arrayIndex = [0];
    expect(dataset.getDataBlocks(arrayIndex)).toHaveLength(1);
    expect(dataset.getDataBlocks([0, 1])).toHaveLength(2);
    expect(dataset.getDataBlocks().length).toHaveLength(2);
  });

  it('should be possible to remove a dataBlock', () => {
    let arrayIndex = [0];
    dataset.rmDataBlocks(arrayIndex);
    expect(dataset.getDataBlocks().length).toHaveLength(1);
  });

  it('should be possible to remove variables from a dataBlock', () => {
    let column = [6, 7];
    let block = 0;
    let removedVariable = dataset.rmVariablesFromDataBlock(block, column);
    expect(typeof(removedVariable)).toBe('matrix');
    expect(removedVariable.columns).toEqual(2);
    expect(removedVariable.rows).toEqual(34);
    expect(dataset.summary().dataBlock[0].value.rows).toEqual(34);
    expect(dataset.summary().dataBlock[0].value.columns).toEqual(5);
  });

  it('should be possible to add a variable to a dataBlock', () => {
    dataset.addVariableToDataBlock(removedVariable.getColumn(1), 0, 7);
    expect(dataset.summary().dataBlock[0].value.rows).toEqual(34);
    expect(dataset.summary().dataBlock[0].value.columns).toEqual(6);
  });

  it('should be possible to add a variable to a dataBlock from an array', () => {
    let removedArray = removedVariable.getColumn(1).to1DArray;
    dataset.addVariableToDataBlockFromArray(MatremovedArrayrix, 0, 7);
    expect(dataset.summary().dataBlock[0].value.rows).toEqual(34);
    expect(dataset.summary().dataBlock[0].value.columns).toEqual(6);
  });

  it('should be possible to get a variable', () => {
    expect(dataset.getvariable(0)).toHaveLength(34);
  });

  it('should be possible to get variables IDs from a dataset', () => {
    expect(dataset.getVariables()).toHaveLength(7);
  });

  it('should be possible to define variables IDs for a dataset', () => {
    let testVariables = [];
    for (let i = 0; i < 7; i++) {
      testVariables.push(`TESTVAR${i + 1}`);
    }
    dataset.setVariables(testVariables);
    expect(dataset.summary().variables).toHaveLength(7);
    expect(dataset.getVariables()[0]).toBe('TESTVAR1');
  });

  it('should be possible to get observations IDs from a dataset', () => {
    expect(dataset.getObservation()).toHaveLength(34);
  });

  it('should be possible to define observations IDs for a dataset', () => {
    let testObservations = [];
    for (let i = 0; i < 34; i++) {
      testObservations.push(`TESTOBS${i + 1}`);
    }
    dataset.setObservations(testObservations);
    expect(dataset.summary().observations).toHaveLength(34);
    expect(dataset.getObservations()[0]).toBe('TESTOBS1');
  });

  it('should be possible to add metadata to a dataset', () => {
    let metadata = X; //country, species
    dataset.addMetadata(metadata);
    expect(dataset.summary().metadata).toBeDefined();
    expect(dataset.summary().metadata).toHaveLength(2);
  });

  it('should be possible to get metadata by column', () => {
    expect(dataset.getMetadataColumn(0)).toHaveLength(34);
  });

  it('should be possible to get metadata by row', () => {
    expect(dataset.getMetadataRow(0)).toHaveLength(2);
  });

  it('should be possible to get metadata by IDs', () => {
    expect(dataset.getMetadataRowByID('TESTOBS1')).toHaveLength(2);
  });

  it('should be possible to add an observation to a dataset', () => {
    dataset.addObservation(Matrix, row);
    expect();
  });

  it('should be possible to add an observation to a dataset from an array', () => {
    dataset.addObservationFromArray(Matrix, row); // what happen to metadata?
    expect();
  });

  it('should be possible to remove an observation from a dataset', () => {
    dataset.rmObservation(Matrix, row, block);
    expect();
  });
});
