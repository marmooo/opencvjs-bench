import cvO1Init from "./external/opencv/build_O1_wasm/bin/opencv_js.js";
import cvO2Init from "./external/opencv/build_O2_wasm/bin/opencv_js.js";
import cvO3Init from "./external/opencv/build_O3_wasm/bin/opencv_js.js";
import cvOfastInit from "./external/opencv/build_Ofast_wasm/bin/opencv_js.js";
import cvOsInit from "./external/opencv/build_Os_wasm/bin/opencv_js.js";
import cvOzInit from "./external/opencv/build_Oz_wasm/bin/opencv_js.js";
import { Jimp } from "jimp";
import { markdownTable } from "markdown-table";

const cvO1 = await cvO1Init();
const cvO2 = await cvO2Init();
const cvO3 = await cvO3Init();
const cvOfast = await cvOfastInit();
const cvOs = await cvOsInit();
const cvOz = await cvOzInit();
const imgPath = "flower.jpg";
const img = await Jimp.read(imgPath);

const header = [
  "task",
  "-O1",
  "-O2",
  "-O3",
  "-Ofast",
  "-Os",
  "-Oz",
];
const blurSize = 11;

function benchmarkSync(func, warmup = 3, repeat = 5) {
  const firstRun = func();
  for (let i = 0; i < warmup; ++i) func();
  const times = [];
  for (let i = 0; i < repeat; ++i) {
    times.push(func());
  }
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  return { firstRun, avg };
}

function split(name, cv, img) {
  const src = cv.matFromImageData(img.bitmap);
  const channels = new cv.MatVector();
  const result = benchmarkSync(() => {
    const t1 = performance.now();
    cv.split(src, channels);
    const t2 = performance.now();
    return t2 - t1;
  });

  src.delete();
  for (let i = 0; i < channels.size(); ++i) {
    channels.get(i).delete();
  }
  channels.delete();
  console.log(name, result);
  return result;
}

function LUT(name, cv, img) {
  const src = cv.matFromImageData(img.bitmap);
  const lut = new cv.Mat(1, 256, cv.CV_8UC1);
  for (let i = 0; i < 256; i++) {
    lut.ucharPtr(0, i)[0] = 255 - i;
  }

  const result = benchmarkSync(() => {
    const t1 = performance.now();
    cv.LUT(src, lut, src);
    const t2 = performance.now();
    return t2 - t1;
  });

  src.delete();
  lut.delete();
  console.log(name, result);
  return result;
}

function adaptiveThreshold(name, cv, img) {
  const srcColor = cv.matFromImageData(img.bitmap);
  const src = new cv.Mat();

  cv.cvtColor(srcColor, src, cv.COLOR_RGBA2GRAY);

  const result = benchmarkSync(() => {
    const t1 = performance.now();
    cv.adaptiveThreshold(
      src,
      src,
      255,
      cv.ADAPTIVE_THRESH_MEAN_C, // cv.ADAPTIVE_THRESH_GAUSSIAN_C
      cv.THRESH_BINARY,
      11, // blockSize
      2, // C
    );
    const t2 = performance.now();
    return t2 - t1;
  });

  srcColor.delete();
  src.delete();
  console.log(name, result);
  return result;
}

function blur(name, cv, img) {
  const src = cv.matFromImageData(img.bitmap);

  const result = benchmarkSync(() => {
    const t1 = performance.now();
    cv.blur(
      src,
      src,
      new cv.Size(blurSize, blurSize),
      new cv.Point(-1, -1),
      cv.BORDER_DEFAULT,
    );
    const t2 = performance.now();
    return t2 - t1;
  });

  src.delete();
  console.log(name, result);
  return result;
}

function Canny(name, cv, img) {
  const src = cv.matFromImageData(img.bitmap);
  const gray = new cv.Mat();
  const edges = new cv.Mat();

  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

  const result = benchmarkSync(() => {
    const t1 = performance.now();
    cv.Canny(gray, edges, 50, 150);
    const t2 = performance.now();
    return t2 - t1;
  });

  src.delete();
  gray.delete();
  edges.delete();
  console.log(name, result);
  return result;
}

function cvtColor(name, cv, img) {
  const src = cv.matFromImageData(img.bitmap);
  const dst = new cv.Mat();

  const result = benchmarkSync(() => {
    const t1 = performance.now();
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
    const t2 = performance.now();
    return t2 - t1;
  });

  src.delete();
  dst.delete();
  console.log(name, result);
  return result;
}

function boxFilter(name, cv, img) {
  const src = cv.matFromImageData(img.bitmap);

  const result = benchmarkSync(() => {
    const t1 = performance.now();
    cv.boxFilter(
      src,
      src,
      -1,
      new cv.Size(blurSize, blurSize),
      new cv.Point(-1, -1),
      true,
      cv.BORDER_DEFAULT,
    );
    const t2 = performance.now();
    return t2 - t1;
  });

  src.delete();
  console.log(name, result);
  return result;
}

function dilate(name, cv, img) {
  const src = cv.matFromImageData(img.bitmap);
  const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));

  const result = benchmarkSync(() => {
    const t1 = performance.now();
    cv.dilate(src, src, kernel);
    const t2 = performance.now();
    return t2 - t1;
  });

  src.delete();
  kernel.delete();
  console.log(name, result);
  return result;
}

function erode(name, cv, img) {
  const src = cv.matFromImageData(img.bitmap);
  const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));

  const result = benchmarkSync(() => {
    const t1 = performance.now();
    cv.erode(src, src, kernel);
    const t2 = performance.now();
    return t2 - t1;
  });

  src.delete();
  kernel.delete();
  console.log(name, result);
  return result;
}

function findContours(name, cv, img) {
  const src = cv.matFromImageData(img.bitmap);
  const gray = new cv.Mat();
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();

  cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
  cv.threshold(gray, gray, 127, 255, cv.THRESH_BINARY);

  const result = benchmarkSync(() => {
    const t1 = performance.now();
    cv.findContours(
      gray,
      contours,
      hierarchy,
      cv.RETR_EXTERNAL,
      cv.CHAIN_APPROX_SIMPLE,
    );
    const t2 = performance.now();
    return t2 - t1;
  });

  src.delete();
  gray.delete();
  contours.delete();
  hierarchy.delete();
  console.log(name, result);
  return result;
}

function GaussianBlur(name, cv, img) {
  const src = cv.matFromImageData(img.bitmap);

  const result = benchmarkSync(() => {
    const t1 = performance.now();
    cv.GaussianBlur(src, src, new cv.Size(blurSize, blurSize), 0);
    const t2 = performance.now();
    return t2 - t1;
  });

  src.delete();
  console.log(name, result);
  return result;
}

function resize(name, cv, img) {
  const src = cv.matFromImageData(img.bitmap);
  const dst = new cv.Mat();

  const result = benchmarkSync(() => {
    const t1 = performance.now();
    cv.resize(src, dst, new cv.Size(2000, 2000), 0, 0, cv.INTER_LINEAR);
    const t2 = performance.now();
    return t2 - t1;
  });

  src.delete();
  dst.delete();
  console.log(name, result);
  return result;
}

function stackBlur(name, cv, img) {
  const src = cv.matFromImageData(img.bitmap);

  const result = benchmarkSync(() => {
    const t1 = performance.now();
    cv.stackBlur(src, src, new cv.Size(blurSize, blurSize));
    const t2 = performance.now();
    return t2 - t1;
  });

  src.delete();
  console.log(name, result);
  return result;
}

function benchCvO1(cv, func, img) {
  return func("O1", cv, img);
}

function benchCvO2(cv, func, img) {
  return func("O2", cv, img);
}

function benchCvO3(cv, func, img) {
  return func("O3", cv, img);
}

function benchCvOfast(cv, func, img) {
  return func("Ofast", cv, img);
}

function benchCvOs(cv, func, img) {
  return func("Os", cv, img);
}

function benchCvOz(cv, func, img) {
  return func("Oz", cv, img);
}

function benchWasm(name, func) {
  console.log(name);
  const O1 = benchCvO1(cvO1, func, img);
  const O2 = benchCvO2(cvO2, func, img);
  const O3 = benchCvO3(cvO3, func, img);
  const Ofast = benchCvOfast(cvOfast, func, img);
  const Os = benchCvOs(cvOs, func, img);
  const Oz = benchCvOz(cvOz, func, img);
  console.log();
  return [name, O1, O2, O3, Ofast, Os, Oz];
}

const result = [];
result.push(benchWasm("split", split));
result.push(benchWasm("LUT", LUT));
result.push(benchWasm("adaptiveThreshold", adaptiveThreshold));
result.push(benchWasm("blur", blur));
result.push(benchWasm("Canny", Canny));
result.push(benchWasm("cvtColor", cvtColor));
result.push(benchWasm("boxFilter", boxFilter));
result.push(benchWasm("dilate", dilate));
result.push(benchWasm("erode", erode));
result.push(benchWasm("findContours", findContours));
result.push(benchWasm("GaussianBlur", GaussianBlur));
result.push(benchWasm("resize", resize));
result.push(benchWasm("stackBlur", stackBlur));

const firstRunResult = result.map((row) => {
  const times = row.slice(1).map((result) => {
    return result.firstRun.toFixed(3);
  });
  return [row[0], ...times];
});
const firstRunTable = [header, ...firstRunResult];
console.log("firstRun");
console.log(markdownTable(firstRunTable, {
  align: ["l", "r", "r", "r", "r", "r", "r"],
}));

console.log("avg");
const avgResult = result.map((row) => {
  const times = row.slice(1).map((result) => {
    return result.avg.toFixed(3);
  });
  return [row[0], ...times];
});
const avgTable = [header, ...avgResult];
console.log(markdownTable(avgTable, {
  align: ["l", "r", "r", "r", "r", "r", "r"],
}));

Deno.exit(0);
