import cvJsInit from "./external/opencv/build_js/bin/opencv_js.js";
import cvWasmInit from "./external/opencv/build_wasm/bin/opencv_js.js";
import cvSimdInit from "./external/opencv/build_simd/bin/opencv_js.js";
import cvThreadsInit from "./external/opencv/build_threads/bin/opencv_js.js";
import cvThreadedSimdInit from "./external/opencv/build_threaded-simd/bin/opencv_js.js";
import { Jimp } from "jimp";
import { markdownTable } from "markdown-table";

const cvJs = await cvJsInit();
const cvWasm = await cvWasmInit();
const cvSimd = await cvSimdInit();
const cvThreads = await cvThreadsInit();
const cvThreadedSimd = await cvThreadedSimdInit();
const imgPath = "flower.jpg";
const img = await Jimp.read(imgPath);

const header = [
  "task",
  "js",
  "wasm",
  "simd",
  "threads",
  "threaded-simd",
  "cpp",
];
const blurSize = 11;

function benchmark(func, warmup = 3, repeat = 5) {
  const firstRun = func();
  for (let i = 0; i < warmup; ++i) func();
  const times = [];
  for (let i = 0; i < repeat; ++i) {
    times.push(func());
  }
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  return { firstRun, avg };
}

async function benchmarkAsync(func, warmup = 3, repeat = 5) {
  const firstRun = await func();
  for (let i = 0; i < warmup; ++i) await func();
  const times = [];
  for (let i = 0; i < repeat; ++i) {
    times.push(await func());
  }
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  return { firstRun, avg };
}

function split(name, cv, img) {
  const src = cv.matFromImageData(img.bitmap);
  const channels = new cv.MatVector();
  const result = benchmark(() => {
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

  const result = benchmark(() => {
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

  const result = benchmark(() => {
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

  const result = benchmark(() => {
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

  const result = benchmark(() => {
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

  const result = benchmark(() => {
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

  const result = benchmark(() => {
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

  const result = benchmark(() => {
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

  const result = benchmark(() => {
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

  const result = benchmark(() => {
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

  const result = benchmark(() => {
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

  const result = benchmark(() => {
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

  const result = benchmark(() => {
    const t1 = performance.now();
    cv.stackBlur(src, src, new cv.Size(blurSize, blurSize));
    const t2 = performance.now();
    return t2 - t1;
  });

  src.delete();
  console.log(name, result);
  return result;
}

async function benchCvCpp(name, imgPath) {
  const result = await benchmarkAsync(async () => {
    const command = new Deno.Command("./build/bench", {
      args: [name, imgPath],
    });
    const { code, stdout, stderr } = await command.output();
    if (code !== 0) {
      console.log(new TextDecoder().decode(stderr).trimEnd());
    }
    return Number(new TextDecoder().decode(stdout).trimEnd());
  });
  console.log("cpp", result);
  return result;
}

function benchCvJs(cv, func, img) {
  return func("js", cv, img);
}

function benchCvWasm(cv, func, img) {
  return func("wasm", cv, img);
}

function benchCvSimd(cv, func, img) {
  return func("simd", cv, img);
}

function benchCvThreads(cv, func, img) {
  return func("threads", cv, img);
}

function benchCvThreadedSimd(cv, func, img) {
  return func("threaded-simd", cv, img);
}

async function benchWasm(name, func) {
  console.log(name);
  const js = benchCvJs(cvJs, func, img);
  const wasm = benchCvWasm(cvWasm, func, img);
  const simd = benchCvSimd(cvSimd, func, img);
  const threads = benchCvThreads(cvThreads, func, img);
  const threadedSimd = benchCvThreadedSimd(cvThreadedSimd, func, img);
  const cpp = await benchCvCpp(name, imgPath);
  console.log();
  return [name, js, wasm, simd, threads, threadedSimd, cpp];
}

const result = [];
result.push(await benchWasm("split", split));
result.push(await benchWasm("LUT", LUT));
result.push(await benchWasm("adaptiveThreshold", adaptiveThreshold));
result.push(await benchWasm("blur", blur));
result.push(await benchWasm("Canny", Canny));
result.push(await benchWasm("cvtColor", cvtColor));
result.push(await benchWasm("boxFilter", boxFilter));
result.push(await benchWasm("dilate", dilate));
result.push(await benchWasm("erode", erode));
result.push(await benchWasm("findContours", findContours));
result.push(await benchWasm("GaussianBlur", GaussianBlur));
result.push(await benchWasm("resize", resize));
result.push(await benchWasm("stackBlur", stackBlur));

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
