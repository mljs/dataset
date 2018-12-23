// is this function a closure? it works as is, but has not
// the signature  Object = (() => {})();
// const count = (() => {
//     let counter = 0;
//     return () => counter += 1; return counter;
// })();

'use strict';

/**
 * Create classes for dataset
 * @param {String} title A title for the class
 * @param {Array} value An array with class values
*/

const { Matrix } = require('ml');

const shuffle = require('./utils/shuffle.js');

const createDataClasses = (title, value) => {
  let dataClasses = [];
  dataClasses.push({ title, value });
  let nObs = value.length;

  /**
   * Allows to format dataClasses as factor or matrix
   * @param {object} dataClass An object {title, valueArray} with a class
   * @return {object} An object with dataClass in different format
   */
  function getClassVector(dataClass) {
    let title = dataClass.title;
    let classVector = dataClass.value;
    let nObs = classVector.length;
    let type = typeof (classVector[0]);
    let counts = {};
    switch (type) {
      case 'string':
        counts = {};
        classVector.forEach((x) => counts[x] = (counts[x] || 0) + 1);
        break;
      case 'number':
        // classVector = classVector.map((x) => x.toString());
        counts = {};
        classVector.forEach((x) => counts[x] = (counts[x] || 0) + 1);
        break;
      default:
    }
    let groupIDs = Object.keys(counts);
    let nClass = groupIDs.length;
    let classFactor = classVector.map((x) => groupIDs.indexOf(x));
    let classMatrix = Matrix.from1DArray(nObs, 1, classFactor);

    return ({
      title,
      groupIDs,
      nClass,
      classVector,
      classFactor,
      classMatrix
    });
  }

  /**
  * Reorders an array according to new index
  * @param {Array} array An array to reorder
  * @param {Array} newIndex The index with new order
  * @return {Array} The re-ordered array
  */
  function reorder(array, newIndex) {
    let permutedVector = [];
    newIndex.forEach((e) => permutedVector.push(array[e]));
    return permutedVector;
  }

  return ({
    /**
     * Returns dataClass in different formats
     * @param {Array} idx
     * @return {object} dataClass in different formats
     */
    getDataClasses(idx) {
      if (idx) {
        let res = [];
        for (let i in idx) {
          res.push(getClassVector(dataClasses[i]));
        }
        return res;
      } else {
        return dataClasses.map((x) => getClassVector(x));
      }
    },

    /**
     * Adds a dataClass to existing object
     * @param {string} title A title for the new class
     * @param {Array} value An array with the new class values
     * @return {object} The same object with an additional class
     */
    addDataClass(title, value) {
      dataClasses.push({ title, value });
      return this;
    },

    /**
     * Gets permuted classes for permutation validations
     * @param {Array} idx An array with index of dataClasses to be permuted
     * if omitted, all dataClasses will be perumted and returned
     * @return {object} An object with permuted dataClasses in different formats
     */
    getPermutedClasses(idx) {
      // create index
      let index = [];
      for (let i = 0; i < nObs; i++) {
        index.push(i);
      }

      // shuffle the index vector
      let shuffledIndex = shuffle(index.slice(0));

      // create back index
      // let sortedIndex = JSON.parse(JSON.stringify(shuffledIndex));
      // let backIndex = Array.from(Array(sortedIndex.length).keys())
      //   .sort((a, b) => (sortedIndex[a] < sortedIndex[b] ? -1 :
      //     (sortedIndex[b] < sortedIndex[a]) | 0));

      // reorder the classVectors
      if (idx) {
        let res = [];
        for (let i in idx) {
          let value = reorder(dataClasses[i].value.slice(0), shuffledIndex);
          let title = `${dataClasses[i].title}_permuted`;
          res.push(getClassVector({ title, value }));
        }
        return res;
      } else {
        return dataClasses.map((x) => {
          let value = reorder(x.value.slice(0), shuffledIndex);
          let title = `${x.title}_permuted`;
          return getClassVector({ title, value });
        });
      }
    },

    /**
     * Removes observations accroding to index and return a clean dataClass
     * @param {Array} idx Index of observations to remove
     * @return {object} A new dataClass object
     */
    filterObservationsByIndex(idx) {
      let newClasses;
      for (let i = 0; i < dataClasses.length; i++) {
        let value = dataClasses[i].value.slice(0).filter((v, i) => !idx.includes(i));
        let title = `${dataClasses[i].title}_filtered`;
        if (i === 0) {
          newClasses = createDataClasses(title, value);
        } else {
          newClasses.addDataClass(title, value);
        }
      }
      return newClasses;
    },

    /**
     * Samples the dataClass according to populations. Tries to keep the sample balanced
     * @param {Array} idx The index of the dataClass to be sampled
     * @param {number} fraction The fraction that must be sampled
     * @return {Array} An array with index of sampled observations
     */
    sampleByClasses(idx, fraction) {
      let classVector = getClassVector(dataClasses[idx]).classVector;
      // sort the vector
      let classVectorSorted = JSON.parse(JSON.stringify(classVector));
      let result = Array.from(Array(classVectorSorted.length).keys())
        .sort((a, b) => (classVectorSorted[a] < classVectorSorted[b] ? -1 :
          (classVectorSorted[b] < classVectorSorted[a]) | 0));
      classVectorSorted.sort((a, b) => (a < b ? -1 : (b < a) | 0));

      // counts the class elements
      let counts = {};
      classVectorSorted.forEach((x) => counts[x] = (counts[x] || 0) + 1);

      // pick a few per class
      let indexOfSelected = [];

      Object.keys(counts).forEach((e, i) => {
        let shift = [];
        Object.values(counts).reduce((a, c, i) => shift[i] = a + c, 0);

        let arr = [...Array(counts[e]).keys()];

        let r = [];
        for (let i = 0; i < Math.floor(counts[e] * fraction); i++) {
          let n = arr[Math.floor(Math.random() * arr.length)];
          r.push(n);
          let ind = arr.indexOf(n);
          arr.splice(ind, 1);
        }

        (i == 0) ? indexOfSelected = indexOfSelected.concat(r) : indexOfSelected = indexOfSelected.concat(r.map((x) => x + shift[i - 1]));
      });

      // sort back the index
      let indexBack = [];
      indexOfSelected.forEach((e) => indexBack.push(result[e]));

      return indexBack;
    },

    /**
     * Exports the original data plus some info and display a summary
     * @param {number} verbose Set to 1 this will display a summary in the console
     * @return {object} An object containing the original values and some info about dimensions
     */
    summary(verbose = 0) {
      let nClass = dataClasses.length;
      if (verbose === 1) {
        console.log(`Number of Classes: ${dataClasses.length}
        \nNumber of observations: ${nObs}`);
      }
      return ({
        dataClasses,
        nObs,
        nClass
      });
    }
  });
};

module.exports = createDataClasses;

