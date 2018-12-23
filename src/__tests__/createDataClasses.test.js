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
  let permutations = shuffle(metadata.slice(0));
  let dataClass = createDataClasses('species',
    metadata).addClass('permutation', permutations);
  console.log(dataClass.summary());
  let counts = {};
  dataClass[1].value.forEach((x) => counts[x] = (counts[x] || 0) + 1);

  it('test getClass', () => {
    expect(dataClass[0].value).toHaveLength(150);
    expect(dataClass[0].value).toMatchSnapshot();
    console.log(dataClass[0].value[0]);
    expect(dataClass[0].value[0]).toEqual('setosa');
  });

  it('test addClass', () => {
    expect(dataClass.map((x) => x.title)).toHaveLength(2);
  });

  it('test permutations', () => {
    expect(dataClass[1].value).toHaveLength(150);
    expect(counts.setosa).toEqual(50);
  });
});
