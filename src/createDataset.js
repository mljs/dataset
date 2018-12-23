'use strict';

let Utils = {};
Utils.norm = function norm(X) {
  return Math.sqrt(X.clone().apply(pow2array).sum());
};


const {
  Matrix,
  MatrixStat: Stat,
  ArrayStat
} = require('ml');

const computeMean = ArrayStat.mean;
const mean = Stat.mean;
const stdev = Stat.standardDeviation;


// ============================================
// Factory functions
// ============================================

// factory function to create datasets
// factory function are preferred to class because of flexibility
// https://medium.com/javascript-scene/javascript-factory-functions-with-es6-4d224591a8b1

/**
 * A dataset has observations (rows)
 * Each observation has variables (columns)
 * Details about observations and variables are described as options
 * @param {Matrix} dataMatrix - must have dimensions (observations.length x variables.length)
 * @param {Object} options
 * @param {Array} [options.observations] An array with obervations unique identifiers
 * @param {Array} [options.variables] An array with names of variables
 * @param {String} [options.description] A simple description of the dataset
 * @param {Array} [options.dataClass] A multidimensional array describing the class of each observations
 * @param {Array} [options.outliers] An array of outliers objects
 * @param {Array} [options.metadata] An array of objects containing additional information about each observations
 */

const createDataset = ({ dataMatrix, options } = {}) => {
  let nObs = dataMatrix.rows;
  let nVar = dataMatrix.columns;

  let aa = {};
  const {
    descriptio = 123
    // observations = Array(nObs).fill(null).map((x, i) => 'OBS' + (i + 1)),
    // variables = Array(nVar).fill(null).map((x, i) => 'VAR' + (i + 1)),
    // description = 'NA'
    // metadata = [],
    // outliers = []
  } = aa;

  let defaults = {
    observations: Array(nObs).fill(null).map((x, i) => `OBS${i + 1}`),
    variables: Array(nVar).fill(null).map((x, i) => `VAR${i + 1}`),
    description: 'NA',
    metadata: [],
    outliers: []
  };

  options = Object.assign({}, defaults, options);

  let observations = options.observations;
  let variables = options.variables;
  let description = options.description;
  let dataClass = options.dataClass;
  let metadata = options.metadata;
  let outliers = options.outliers;

  if (options.observations.length !== nObs ||
        options.variables.length !== nVar ||
        options.dataClass[0].value.length !== nObs) {
    throw new RangeError('observations and dataMatrix have different number of rows');
  }

  // private util functions

  function getRowIndexByID() {
    let sampleList = observations.map((x) => x);
    let outlierList = outliers.map((x) => x.id);
    let ind = outlierList.map((e) => sampleList.indexOf(e));
    return ind;
  }

  function getClassVector(dataClass) {
    let title = dataClass.title;
    let classVector = dataClass.value;
    let type = typeof (classVector[0]);
    let counts = {};
    switch (type) {
      case 'string':
        counts = {};
        classVector.forEach((x) => counts[x] = (counts[x] || 0) + 1);
        break;
      case 'number':
        classVector = classVector.map((x) => x.toString());
        counts = {};
        classVector.forEach((x) => counts[x] = (counts[x] || 0) + 1);
        break;
      default:
    }
    let groupIDs = Object.keys(counts);
    let nClass = groupIDs.length;
    let classFactor = classVector.map((x) => groupIDs.indexOf(x));
    let classMatrix = Matrix.from1DArray(nObs, 1, classFactor);
    return ({ title,
      groupIDs,
      nClass,
      classVector,
      classFactor,
      classMatrix
    });
  }

  return ({ description,

    // API exposed functions

    getClass() {
      let a = dataClass.map((x) => getClassVector(x));
      return a;
    },

    getOutliers() {
      return outliers;
    },

    addOutliers(outliersList) {
      let outliersIDs = outliers.map((x) => x.id);
      let newList = outliersList.filter((f) => !outliersIDs.includes(f.id));
      console.log(newList);
      if (newList.length > 0) newList.forEach((e) => outliers.push(e));
      console.log(outliers);
      this.summary();
      // return this;
    },

    rmOutliers(outliersList) {
      outliers = outliers.filter((f) => !outliersList.includes(f.id));
      console.log(outliers);
      this.summary();
      // return this;
    },

    clean() {
      if (outliers.length > 0) {
        let ind = getRowIndexByID();
        console.log(ind);
        let cleanObservations = observations.filter((e, i) => !ind.includes(i));
        let cleanDataMatrix = new Matrix(nObs - ind.length, nVar);

        let counter = 0;
        dataMatrix.forEach((e, i) => {
          if (!ind.includes(i)) {
            cleanDataMatrix.setRow(counter, e);
            counter += 1;
          }
        });

        let cleanDataClass = dataClass.map((x) => {
          return { title: x.title,
            value: x.value.filter((e, i) => !ind.includes(i)) };
        });
        // let cleanMetadata = metadata.filter((e, i) => !ind.includes(i));

        return Dataset({
          dataMatrix: cleanDataMatrix,
          options: {
            observations: cleanObservations,
            variables: variables,
            dataClass: cleanDataClass,
            outliers: [],
            // metadata: cleanMetadata, // lack of test for dimensions
            description: `clean ${description}` } });
      } else {
        return this;
      }
    },

    sample(list) {
      // console.log(list.length)
      if (list.length > 0) {
        let ind = list;
        // console.log(ind);
        // filter Observations vector

        let trainObservations = observations.filter((e, i) => !ind.includes(i));
        let testObservations = observations.filter((e, i) => ind.includes(i));

        // filter data matrix
        let trainDataMatrix = new Matrix(nObs - ind.length, nVar);
        let testDataMatrix = new Matrix(ind.length, nVar);

        let counter = 0;
        dataMatrix.forEach((e, i) => {
          if (!ind.includes(i)) {
            trainDataMatrix.setRow(counter, e);
            counter += 1;
          }
        });

        counter = 0;
        dataMatrix.forEach((e, i) => {
          if (ind.includes(i)) {
            testDataMatrix.setRow(counter, e);
            counter += 1;
          }
        });

        // filter class vector
        let trainDataClass = dataClass.map((x) => {
          return { title: x.title,
            value: x.value.filter((e, i) => !ind.includes(i)) };
        });

        let testDataClass = dataClass.map((x) => {
          return { title: x.title,
            value: x.value.filter((e, i) => ind.includes(i)) };
        });

        // let cleanMetadata = metadata.filter((e, i) => !ind.includes(i));

        let train = Dataset({
          dataMatrix: trainDataMatrix,
          options: {
            observations: trainObservations,
            variables: variables,
            dataClass: trainDataClass,
            outliers: [],
            // metadata: cleanMetadata, // lack of test for dimensions
            description: `train ${description}` } });

        let test = Dataset({
          dataMatrix: testDataMatrix,
          options: {
            observations: testObservations,
            variables: variables,
            dataClass: testDataClass,
            outliers: [],
            // metadata: cleanMetadata, // lack of test for dimensions
            description: `test ${description}` } });

        return { train, test };
      } else {
        return this;
      }
    },

    // return everything but cannot be changed
    summary(verbose = 0) {
      if (verbose === 1) {
        console.log(`Description: ${description
        }\nNumber of variables: ${nVar
        }\nNumber of observations: ${nObs
        }\nNumber of outliers:${outliers.length
        }\nHas class: ${dataClass.length
        }\nHas metadata: ${metadata.length > 0}`);
      }
      return ({ dataMatrix,
        dataClass,
        nObs,
        nVar,
        observations,
        variables,
        metadata,
        description
      });
    }

  });
};

module.exports = createDataset;