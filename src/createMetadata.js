// is this function a closure? it works as is, but has not
// the signature  Object = (() => {})();
// const count = (() => {
//     let counter = 0;
//     return () => counter += 1; return counter;
// })();

'use strict';

const { Matrix } = require('ml');

const shuffle = require('./utils/shuffle.js');

/**
 * Create classes for dataset
 * @param {string} title A title for the class
 * @param {Array} value An array with class values
 * @return {function} Methods to retrieve dataClasses
 * @requires ml
 * @requires utils/shuffle
*/
const createDataClasses = (title, value) => {}
;