'use strict';


// outlier factory
const Outlier = ([id, comment] = {}) => ({
  id,
  comment
});
// let llist = [];
// let list = ['ID2', 'ID3'];
// list.forEach((e,i) => llist.push(Outlier([e])));
// console.log(llist);
//
// a = list.map(x => Outlier([x]));


// ============================================
// Stat functions
// ============================================

function tss(x) {
  return x.mul(x).sum();
}

function featureNormalize(dataset) {
  let means = Stat.mean(dataset);
  let std = Stat.standardDeviation(dataset, means, true);
  let result = Matrix.checkMatrix(dataset).subRowVector(means);
  return { result: result.divRowVector(std), means: means, std: std };
}

function pow2array(i, j) {
  this[i][j] = this[i][j] * this[i][j];
  return this;
}

// https://bost.ocks.org/mike/shuffle/
function shuffle(array) {
  let m = array.length; let t; let i;

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}


function computeQ2(realY, predictedY) {
  realY = Matrix.checkMatrix(realY);
  predictedY = Matrix.checkMatrix(predictedY);
  let meansY = Stat.mean(realY);

  let press = predictedY.map((row, rowIndex) => {
    return row.map((element, colIndex) => {
      return Math.pow(realY[rowIndex][colIndex] - element, 2);
    });
  });


  let tss = Y.map((row) => {
    return row.map((element, colIndex) => {
      return Math.pow(element - meansY[colIndex], 2);
    });
  });

  press = Matrix.checkMatrix(press).sum();
  tss = Matrix.checkMatrix(tss).sum();

  return 1 - press / tss;
}

function getColSum(matrix, column) {
  let sum = 0;
  for (let i = 0; i < matrix.rows; i++) {
    sum += matrix[i][column];
  }
  return sum;
}

function maxSumColIndex(data) {
  let maxIndex = 0;
  let maxSum = -Infinity;
  for (let i = 0; i < data.columns; ++i) {
    let currentSum = getColSum(data, i);
    if (currentSum > maxSum) {
      maxSum = currentSum;
      maxIndex = i;
    }
  }
  return maxIndex;
}


function seq_along(x) {
  return x.map((x, i) => i + 1);
}

function bar(x = [], y) {
  x.length == 0 ? x = y.map((x, i) => i + 1) : [];
  return ({ x, y });
}

function transpose(matrix) {
  return matrix[0].map((col, i) => matrix.map((row) => row[i]));
}


function scale(dataset, options) {
  let center = !!options.center;
  let scale = !!options.scale;

  dataset = new Matrix(dataset);

  if (center) {
    const means = mean(dataset);
    const stdevs = scale ? stdev(dataset, means, true) : null;
    // means = means;
    dataset.subRowVector(means);
    if (scale) {
      for (var i = 0; i < stdevs.length; i++) {
        if (stdevs[i] === 0) {
          throw new RangeError(`Cannot scale the dataset (standard deviation is zero at index ${i}`);
        }
      }
      // stdevs = stdevs;
      dataset.divRowVector(stdevs);
    }
  }

  return dataset;
}

function plot(x, y, observations, dataClass, markerStyle, size) {
  let nClass = dataClass.nClass;

  let selectedScale = chroma.scale(['green', 'black']).domain([0, nClass - 1]).mode('hsl');
  let unselectedScale = chroma.scale(['red', 'blue']).domain([0, nClass - 1]).mode('hsl');
  // console.log(unselectedScale(0).toString());

  let result = {
    title: 'main plot',
    data: [
      {
        x: x,
        y: y,
        type: 'scatter',
        info: Array.from({ length: x.length }, (v, k) => k + 1),
        _highlight: [],
        styles: {
          unselected: new Array(x.length),
          selected: new Array(x.length)
        }
      }
    ]
  };

  let unselected = dataClass.classFactor.map((x, i) => ({
    fill: unselectedScale(x).toString(),
    shape: markerStyle,
    cx: 0,
    cy: 0,
    r: size,
    height: '5px',
    width: '5px',
    stroke: 'transparent'
  }));
  // console.log(unselected);

  let selected = dataClass.classFactor.map((x, i) => ({
    fill: selectedScale(x).toString(),
    shape: markerStyle,
    cx: 0,
    cy: 0,
    r: size,
    height: '5px',
    width: '5px',
    stroke: 'transparent'
  }));

  let highlight = observations.map((x, i) => ({ _highlight: x }));

  result.data[0].styles.unselected = unselected;
  result.data[0].styles.selected = selected;
  result.data[0]._highlight = highlight;

  let ellipse = predictEllipse(x, y, dataClass, 5, 0.95, 1024);

  return { chart: result, ellipse };
}

function plotResult(prediction, observations, dataClass, pcaPlot, varName) {
  let x = prediction.getColumn(pcaPlot.pcx - 1);
  let y = prediction.getColumn(pcaPlot.pcy - 1);

  let nbClasses = dataClass.nClass;

  let selectedScale = chroma.scale(['green', 'black']).domain([0, nbClasses - 1]).mode('hsl');
  let unselectedScale = chroma.scale(['red', 'blue']).domain([0, nbClasses - 1]).mode('hsl');
  // console.log(unselectedScale(0).toString());

  let result = {
    title: 'main plot',
    data: [
      {
        x: x,
        y: y,
        type: 'scatter',
        info: Array.from({ length: x.length }, (v, k) => k + 1),
        _highlight: [],
        styles: {
          unselected: new Array(x.length),
          selected: new Array(x.length)
        }
      }
    ]
  };

  let unselected = dataClass.classFactor.map((x, i) => ({
    fill: unselectedScale(x).toString(),
    shape: 'circle',
    cx: 0,
    cy: 0,
    r: 3,
    height: '5px',
    width: '5px',
    stroke: 'transparent'
  }));
  console.log(unselected);

  let selected = dataClass.classFactor.map((x, i) => ({
    fill: selectedScale(x).toString(),
    shape: 'circle',
    cx: 0,
    cy: 0,
    r: 3,
    height: '5px',
    width: '5px',
    stroke: 'transparent'
  }));

  let highlight = observations.map((x, i) => ({ _highlight: x }));

  result.data[0].styles.unselected = unselected;
  result.data[0].styles.selected = selected;
  result.data[0]._highlight = highlight;

  let ellipse = predictEllipse(x, y, dataClass, 5, 0.95, 1024);

  return { chart: result, ellipse };
}

function PCA_fast(dataset, options = {}) {
  let {
    nComponents = 2,
    threshold = 1e-9,
    maxIterations = 100
  } = options;

  let eMatrix = _adjust(dataset, options);

  let r = eMatrix.rows;
  let c = eMatrix.columns;

  let T = Matrix.zeros(r, nComponents);
  let P = Matrix.zeros(c, nComponents);
  let eigenvalues = new Array(nComponents);

  for (let i = 0; i < nComponents; i++) {
    let tIndex = maxSumColIndex(eMatrix.clone().mulM(eMatrix));
    let t = eMatrix.getColumnVector(tIndex);

    let k = 0;
    let tNew = t.dot(t);
    for (let tOld = Number.MAX_SAFE_INTEGER; Math.abs(tOld - tNew) > threshold && k < maxIterations; k++) {
      let p = getLoading(eMatrix, t);
      t = eMatrix.mmul(p);
      tOld = tNew;
      tNew = t.dot(t);
    }
    eigenvalues[i] = tNew;
    T.setColumn(i, t);
    P.setColumn(i, p);
    eMatrix.sub(t.mmul(p.transpose()));
  }
  return { T, P };
}

function getLoading(e, t) {
  let m = e.columns;
  let n = e.rows;

  let result = new Matrix(m, 1);

  let Bcolj = new Array(n);
  for (let i = 0; i < m; i++) {
    let s = 0;
    for (let k = 0; k < n; k++) {
      s += e.get(k, i) * t[k][0];
    }
    result.set(i, 0, s);
  }
  return result.mul(1 / result.norm());
}

function PLS(dataset, predictions, options = {}) {
  const {
    numberOSC = 2,
    scale = false
  } = options;

  var X = Matrix.checkMatrix(dataset);
  var Y = Matrix.checkMatrix(predictions);

  if (scale) {
    X = featureNormalize(X).result;
    Y = featureNormalize(y).result;
  }
  // console.log(X, Y);
  var rows = X.rows;
  var columns = X.columns;

  var u = Y.getColumnVector(0);
  let diff = 1;
  let t, q, w, tOld;
  for (var i = 0; i < numberOSC && diff > 1e-10; i++) {
    w = X.transpose().mmul(u).div(u.transpose().mmul(u)[0][0]);
    // console.log('w without norm', JSON.stringify(w));
    w = w.div(Utils.norm(w));
    // console.log('w', JSON.stringify(w));
    // console.log(w.transpose().mmul(w));
    // calc X scores
    t = X.mmul(w).div(w.transpose().mmul(w)[0][0]);// t_h paso 3
    // calc loading
    // console.log('scores', t);
    if (i > 0) {
      diff = t.clone().sub(tOld).pow(2).sum();
      // console.log('diff', diff);
    }
    tOld = t.clone();
    // Y block, calc weights, normalise and calc Y scores
    // steps can be omitted for 2 class Y (simply by setting q_h=1)
    q = Y.transpose().mmul(t).div(t.transpose().mmul(t)[0][0]);
    q = q.div(Utils.norm(q));

    u = Y.mmul(q).div(q.transpose().mmul(q)[0][0]);
    console.log(`PLS iteration: ${i}`);
  }
  // calculate the X loadings and rescale scores and weights accordingly
  let xP = X.transpose().mmul(t).div(t.transpose().mmul(t)[0][0]);
  xP = xP.div(Utils.norm(xP));
  // calc Y loadings
  let yP = Y.transpose().mmul(u).div(u.transpose().mmul(u)[0][0]);
  // calc b for residuals Y
  // calculate beta (regression coefficient) via inverse insted of subtracting q_h directly
  let residual = u.transpose().mmul(t).div(t.transpose().mmul(t)[0][0]);
  // console.log('residuals', residual);
  // calc residual matrice X and Y
  let xRes = X.sub(t.clone().mmul(xP.transpose()));
  let yRes = Y.sub(t.clone().mulS(residual[0][0]).mmul(q.transpose()));
  return { xRes, yRes, scores: t, loadings: xP.transpose(), weights: w.transpose(), betas: residual[0][0], qPC: q };
}

function OPLS(dataset, predictions, options = {}) {
  const {
    numberOSC = 100,
    scale = true,
    verbose = false
  } = options;

  let X = Matrix.checkMatrix(dataset);
  let Y = Matrix.checkMatrix(predictions);
  if (verbose) console.log('data checked');

  if (scale) {
    X = featureNormalize(X).result;
    Y = featureNormalize(Y).result;
    if (verbose) console.log('data scaled, if scaling not wanted, set options.scale to false');
  }

  let rows = X.rows;
  let columns = X.columns;
  if (verbose) console.log(`number of rows: ${rows} / number of columns: ${columns}`);

  let sumOfSquaresX = X.clone().mul(X).sum();

  let u = Y.getColumnVector(0);
  let diff = 1;
  let t, c, w, uNew;
  for (let i = 0; i < numberOSC && diff > 1e-10; i++) {
  // for (let i = 0; i < 1; i++) {
    w = u.transpose().mmul(X).div(u.transpose().mmul(u)[0][0]);

    w = w.transpose().div(Utils.norm(w));

    t = X.mmul(w).div(w.transpose().mmul(w)[0][0]);// t_h paso 3

    // calc loading

    c = t.transpose().mmul(Y).div(t.transpose().mmul(t)[0][0]);

    // 4. calc new u and compare with one in previus iteration (stop criterion)
    uNew = Y.mmul(c.transpose());
    uNew = uNew.div(c.transpose().mmul(c)[0][0]);

    if (i > 0) {
      diff = uNew.clone().sub(u).pow(2).sum() / uNew.clone().pow(2).sum();
      if (verbose) console.log('diff', diff);
    }

    u = uNew.clone();
    if (verbose) console.log(`number of iterations: ${i}`);
    console.log(`OPLS iteration: ${i}`);
  }
  if (verbose) console.log('unew', uNew);
  // calc loadings
  let p = t.transpose().mmul(X).div(t.transpose().mmul(t)[0][0]);

  let wOrtho = p.clone().sub(w.transpose().mmul(p.transpose()).div(w.transpose().mmul(w)[0][0]).mmul(w.transpose()));
  wOrtho.div(Utils.norm(wOrtho));
  if (verbose) console.log('wOrtho norm', wOrtho);

  // orthogonal scores
  let tOrtho = X.mmul(wOrtho.transpose()).div(wOrtho.transpose().mmul(wOrtho)[0][0]);
  if (verbose) console.log(`scores: ${tOrtho}`);

  // orthogonal loadings
  let pOrtho = tOrtho.transpose().mmul(X).div(tOrtho.transpose().mmul(tOrtho)[0][0]);
  if (verbose) console.log(`loadings: ${pOrtho}`);

  // filtered data
  let err = X.sub(tOrtho.mmul(pOrtho));
  if (verbose) console.log(`filtered data: ${err}`);
  return { err, pOrtho, tOrtho, wOrtho, w, p, t, c };
}


function predictEllipse(x, y, dataClass, n, alpha, nbPoints) {
  // separate data by class
  let toExport = {
    type: 'chart',
    value: {
      data: []
    }
  };
  let nClass = dataClass.nClass;
  let scaleColor = chroma.scale(['green', 'black']).domain([0, nClass - 1]).mode('hsl');
  let yMatrix = new Array(nClass).fill(0).map((e) => []);
  let xMatrix = JSON.parse(JSON.stringify(yMatrix));
  for (let k = 0; k < x.length; k++) {
    let index = dataClass.classFactor[k];
    yMatrix[index].push(y[k]);
    xMatrix[index].push(x[k]);
  }
  for (let k = 0; k < nClass; k++) {
    // console.log(scaleColor(k).toString());
    let xyMatrix = Matrix.from1DArray(xMatrix[k].length, 1, xMatrix[k]);
    xyMatrix.addColumn(1, yMatrix[k]);
    let means = [computeMean(xMatrix[k]), computeMean(yMatrix[k])];
    let pca = new PCA(xyMatrix, { useCovarianceMatrix: true });
    var evec = new Matrix(pca.U);
    let elp = new Matrix(ellipse([0, 0], pca.S, nbPoints));
    elp = evec.mmul(elp.transpose()).transpose();
    let c = 2 * (n - 1) / n * (n + 1) / (n - 2);
    let F = Math.sqrt(c * 4.7374);
    elp = elp.map((point) => {
      return point.map((p, i) => F * p + means[i]);
    });
    elp = new Matrix(elp);
    let xData = elp.getColumn(0);
    let yData = elp.getColumn(1);
    toExport.value.data.push({
      y: yData,
      x: xData
    });
  }
  return toExport;
}

function ellipse(center, std, nbPoints) {
  let vector = new Array(nbPoints);
  let jump = 2 * Math.PI / (nbPoints - 1);
  let t = 0;
  for (let i = 0; i < nbPoints; i++) {
    vector[i] = [center[0] + Math.sqrt(std[0]) * Math.cos(t), center[1] + Math.sqrt(std[1]) * Math.sin(t)];
    t += jump;
  }
  return vector;
}

function log(title, txt) {
  let log = API.getData('log').resurrect();
  log = log.concat('\n', '===============', title, '===============', '\n');
  txt.forEach((e, i) => {
    log = log.concat(Object.keys(e), ' ', Object.values(e), '\n');

    return log;
  });
  API.createData('log', log);
}

API.cache('helperFunctions', {
  DataClass,
  Outlier,
  Dataset,
  oplsWrapper,
  sampleClass,
  transpose,
  bar,
  seq_along,
  scale,
  tss,
  plotResult,
  plot,
  predictEllipse,
  ellipse,
  pow2array,
  featureNormalize,
  shuffle,
  maxSumColIndex,
  getColSum,
  computeQ2,
  PCA_fast,
  PLS,
  OPLS,
  createMatrixClass,
  log
});

// ============================================
// Dataset section
// ============================================

const iris = () => {
  const iris = [
    [5.1, 3.5, 1.4, 0.2, 'setosa'],
    [4.9, 3, 1.4, 0.2, 'setosa'],
    [4.7, 3.2, 1.3, 0.2, 'setosa'],
    [4.6, 3.1, 1.5, 0.2, 'setosa'],
    [5, 3.6, 1.4, 0.2, 'setosa'],
    [5.4, 3.9, 1.7, 0.4, 'setosa'],
    [4.6, 3.4, 1.4, 0.3, 'setosa'],
    [5, 3.4, 1.5, 0.2, 'setosa'],
    [4.4, 2.9, 1.4, 0.2, 'setosa'],
    [4.9, 3.1, 1.5, 0.1, 'setosa'],
    [5.4, 3.7, 1.5, 0.2, 'setosa'],
    [4.8, 3.4, 1.6, 0.2, 'setosa'],
    [4.8, 3, 1.4, 0.1, 'setosa'],
    [4.3, 3, 1.1, 0.1, 'setosa'],
    [5.8, 4, 1.2, 0.2, 'setosa'],
    [5.7, 4.4, 1.5, 0.4, 'setosa'],
    [5.4, 3.9, 1.3, 0.4, 'setosa'],
    [5.1, 3.5, 1.4, 0.3, 'setosa'],
    [5.7, 3.8, 1.7, 0.3, 'setosa'],
    [5.1, 3.8, 1.5, 0.3, 'setosa'],
    [5.4, 3.4, 1.7, 0.2, 'setosa'],
    [5.1, 3.7, 1.5, 0.4, 'setosa'],
    [4.6, 3.6, 1, 0.2, 'setosa'],
    [5.1, 3.3, 1.7, 0.5, 'setosa'],
    [4.8, 3.4, 1.9, 0.2, 'setosa'],
    [5, 3, 1.6, 0.2, 'setosa'],
    [5, 3.4, 1.6, 0.4, 'setosa'],
    [5.2, 3.5, 1.5, 0.2, 'setosa'],
    [5.2, 3.4, 1.4, 0.2, 'setosa'],
    [4.7, 3.2, 1.6, 0.2, 'setosa'],
    [4.8, 3.1, 1.6, 0.2, 'setosa'],
    [5.4, 3.4, 1.5, 0.4, 'setosa'],
    [5.2, 4.1, 1.5, 0.1, 'setosa'],
    [5.5, 4.2, 1.4, 0.2, 'setosa'],
    [4.9, 3.1, 1.5, 0.2, 'setosa'],
    [5, 3.2, 1.2, 0.2, 'setosa'],
    [5.5, 3.5, 1.3, 0.2, 'setosa'],
    [4.9, 3.6, 1.4, 0.1, 'setosa'],
    [4.4, 3, 1.3, 0.2, 'setosa'],
    [5.1, 3.4, 1.5, 0.2, 'setosa'],
    [5, 3.5, 1.3, 0.3, 'setosa'],
    [4.5, 2.3, 1.3, 0.3, 'setosa'],
    [4.4, 3.2, 1.3, 0.2, 'setosa'],
    [5, 3.5, 1.6, 0.6, 'setosa'],
    [5.1, 3.8, 1.9, 0.4, 'setosa'],
    [4.8, 3, 1.4, 0.3, 'setosa'],
    [5.1, 3.8, 1.6, 0.2, 'setosa'],
    [4.6, 3.2, 1.4, 0.2, 'setosa'],
    [5.3, 3.7, 1.5, 0.2, 'setosa'],
    [5, 3.3, 1.4, 0.2, 'setosa'],
    [7, 3.2, 4.7, 1.4, 'versicolor'],
    [6.4, 3.2, 4.5, 1.5, 'versicolor'],
    [6.9, 3.1, 4.9, 1.5, 'versicolor'],
    [5.5, 2.3, 4, 1.3, 'versicolor'],
    [6.5, 2.8, 4.6, 1.5, 'versicolor'],
    [5.7, 2.8, 4.5, 1.3, 'versicolor'],
    [6.3, 3.3, 4.7, 1.6, 'versicolor'],
    [4.9, 2.4, 3.3, 1, 'versicolor'],
    [6.6, 2.9, 4.6, 1.3, 'versicolor'],
    [5.2, 2.7, 3.9, 1.4, 'versicolor'],
    [5, 2, 3.5, 1, 'versicolor'],
    [5.9, 3, 4.2, 1.5, 'versicolor'],
    [6, 2.2, 4, 1, 'versicolor'],
    [6.1, 2.9, 4.7, 1.4, 'versicolor'],
    [5.6, 2.9, 3.6, 1.3, 'versicolor'],
    [6.7, 3.1, 4.4, 1.4, 'versicolor'],
    [5.6, 3, 4.5, 1.5, 'versicolor'],
    [5.8, 2.7, 4.1, 1, 'versicolor'],
    [6.2, 2.2, 4.5, 1.5, 'versicolor'],
    [5.6, 2.5, 3.9, 1.1, 'versicolor'],
    [5.9, 3.2, 4.8, 1.8, 'versicolor'],
    [6.1, 2.8, 4, 1.3, 'versicolor'],
    [6.3, 2.5, 4.9, 1.5, 'versicolor'],
    [6.1, 2.8, 4.7, 1.2, 'versicolor'],
    [6.4, 2.9, 4.3, 1.3, 'versicolor'],
    [6.6, 3, 4.4, 1.4, 'versicolor'],
    [6.8, 2.8, 4.8, 1.4, 'versicolor'],
    [6.7, 3, 5, 1.7, 'versicolor'],
    [6, 2.9, 4.5, 1.5, 'versicolor'],
    [5.7, 2.6, 3.5, 1, 'versicolor'],
    [5.5, 2.4, 3.8, 1.1, 'versicolor'],
    [5.5, 2.4, 3.7, 1, 'versicolor'],
    [5.8, 2.7, 3.9, 1.2, 'versicolor'],
    [6, 2.7, 5.1, 1.6, 'versicolor'],
    [5.4, 3, 4.5, 1.5, 'versicolor'],
    [6, 3.4, 4.5, 1.6, 'versicolor'],
    [6.7, 3.1, 4.7, 1.5, 'versicolor'],
    [6.3, 2.3, 4.4, 1.3, 'versicolor'],
    [5.6, 3, 4.1, 1.3, 'versicolor'],
    [5.5, 2.5, 4, 1.3, 'versicolor'],
    [5.5, 2.6, 4.4, 1.2, 'versicolor'],
    [6.1, 3, 4.6, 1.4, 'versicolor'],
    [5.8, 2.6, 4, 1.2, 'versicolor'],
    [5, 2.3, 3.3, 1, 'versicolor'],
    [5.6, 2.7, 4.2, 1.3, 'versicolor'],
    [5.7, 3, 4.2, 1.2, 'versicolor'],
    [5.7, 2.9, 4.2, 1.3, 'versicolor'],
    [6.2, 2.9, 4.3, 1.3, 'versicolor'],
    [5.1, 2.5, 3, 1.1, 'versicolor'],
    [5.7, 2.8, 4.1, 1.3, 'versicolor'],
    [6.3, 3.3, 6, 2.5, 'virginica'],
    [5.8, 2.7, 5.1, 1.9, 'virginica'],
    [7.1, 3, 5.9, 2.1, 'virginica'],
    [6.3, 2.9, 5.6, 1.8, 'virginica'],
    [6.5, 3, 5.8, 2.2, 'virginica'],
    [7.6, 3, 6.6, 2.1, 'virginica'],
    [4.9, 2.5, 4.5, 1.7, 'virginica'],
    [7.3, 2.9, 6.3, 1.8, 'virginica'],
    [6.7, 2.5, 5.8, 1.8, 'virginica'],
    [7.2, 3.6, 6.1, 2.5, 'virginica'],
    [6.5, 3.2, 5.1, 2, 'virginica'],
    [6.4, 2.7, 5.3, 1.9, 'virginica'],
    [6.8, 3, 5.5, 2.1, 'virginica'],
    [5.7, 2.5, 5, 2, 'virginica'],
    [5.8, 2.8, 5.1, 2.4, 'virginica'],
    [6.4, 3.2, 5.3, 2.3, 'virginica'],
    [6.5, 3, 5.5, 1.8, 'virginica'],
    [7.7, 3.8, 6.7, 2.2, 'virginica'],
    [7.7, 2.6, 6.9, 2.3, 'virginica'],
    [6, 2.2, 5, 1.5, 'virginica'],
    [6.9, 3.2, 5.7, 2.3, 'virginica'],
    [5.6, 2.8, 4.9, 2, 'virginica'],
    [7.7, 2.8, 6.7, 2, 'virginica'],
    [6.3, 2.7, 4.9, 1.8, 'virginica'],
    [6.7, 3.3, 5.7, 2.1, 'virginica'],
    [7.2, 3.2, 6, 1.8, 'virginica'],
    [6.2, 2.8, 4.8, 1.8, 'virginica'],
    [6.1, 3, 4.9, 1.8, 'virginica'],
    [6.4, 2.8, 5.6, 2.1, 'virginica'],
    [7.2, 3, 5.8, 1.6, 'virginica'],
    [7.4, 2.8, 6.1, 1.9, 'virginica'],
    [7.9, 3.8, 6.4, 2, 'virginica'],
    [6.4, 2.8, 5.6, 2.2, 'virginica'],
    [6.3, 2.8, 5.1, 1.5, 'virginica'],
    [6.1, 2.6, 5.6, 1.4, 'virginica'],
    [7.7, 3, 6.1, 2.3, 'virginica'],
    [6.3, 3.4, 5.6, 2.4, 'virginica'],
    [6.4, 3.1, 5.5, 1.8, 'virginica'],
    [6, 3, 4.8, 1.8, 'virginica'],
    [6.9, 3.1, 5.4, 2.1, 'virginica'],
    [6.7, 3.1, 5.6, 2.4, 'virginica'],
    [6.9, 3.1, 5.1, 2.3, 'virginica'],
    [5.8, 2.7, 5.1, 1.9, 'virginica'],
    [6.8, 3.2, 5.9, 2.3, 'virginica'],
    [6.7, 3.3, 5.7, 2.5, 'virginica'],
    [6.7, 3, 5.2, 2.3, 'virginica'],
    [6.3, 2.5, 5, 1.9, 'virginica'],
    [6.5, 3, 5.2, 2, 'virginica'],
    [6.2, 3.4, 5.4, 2.3, 'virginica'],
    [5.9, 3, 5.1, 1.8, 'virginica']
  ];
  return iris;
};

API.cache('helperDataset', {
  iris
});

API.doAction('tipsOn');

console.log('functions created');
