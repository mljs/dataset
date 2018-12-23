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

const createDataClasses = (title, value) => {
  let dataClasses = [];
  dataClasses.push({ title, value });
  let nObs = value.length;

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

    return ({
      title,
      groupIDs,
      nClass,
      classVector,
      classFactor,
      classMatrix
    });
  }

  return ({
    getClass() {
      return dataClasses.map((x) => getClassVector(x));
    },
    addClass(title, value) {
      dataClasses.push({ title, value });
      return this;
    },
    summary(verbose = 0) {
      let nClass = dataClasses.length;
      if (verbose === 1) {
        console.log(`Number of Classes: ${dataClasses.length}
        \nNumber of observations: ${nObs}`);
      }
      return ({ dataClasses,
        nObs,
        nClass
      });
    }
  });
};

module.exports = createDataClasses;

// let a = DataClass( 'testClass',  ['id1', 'id2', 'id2', 'id1', 'id3'] );
// a.addClass( 'testClass',  ['id1', 'id2', 'id2', 'id1', 'id3'] );
// console.log(a.getClass());
