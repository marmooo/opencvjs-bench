import { markdownTable } from "markdown-table";

const imgPath = "flower.jpg";

const header = [
  "task",
  "-O1",
  "-O2",
  "-O3",
  "-Ofast",
  "-Os",
];

async function benchmark(func, warmup = 3, repeat = 5) {
  const firstRun = await func();
  for (let i = 0; i < warmup; ++i) await func();
  const times = [];
  for (let i = 0; i < repeat; ++i) {
    times.push(await func());
  }
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  return { firstRun, avg };
}

async function benchCvCpp(name, opt, imgPath) {
  const result = await benchmark(async () => {
    const command = new Deno.Command(`./build/cpp_${opt}/bench`, {
      args: [name, imgPath],
    });
    const { code, stdout, stderr } = await command.output();
    if (code !== 0) {
      console.log(new TextDecoder().decode(stderr).trimEnd());
    }
    return Number(new TextDecoder().decode(stdout).trimEnd());
  });
  console.log(opt, result);
  return result;
}

async function benchCpp(name) {
  console.log(name);
  const O1 = await benchCvCpp(name, "O1", imgPath);
  const O2 = await benchCvCpp(name, "O2", imgPath);
  const O3 = await benchCvCpp(name, "O3", imgPath);
  const Ofast = await benchCvCpp(name, "Ofast", imgPath);
  const Os = await benchCvCpp(name, "Os", imgPath);
  console.log();
  return [name, O1, O2, O3, Ofast, Os];
}

const result = [];
result.push(await benchCpp("split"));
result.push(await benchCpp("LUT"));
result.push(await benchCpp("adaptiveThreshold"));
result.push(await benchCpp("blur"));
result.push(await benchCpp("Canny"));
result.push(await benchCpp("cvtColor"));
result.push(await benchCpp("boxFilter"));
result.push(await benchCpp("dilate"));
result.push(await benchCpp("erode"));
result.push(await benchCpp("findContours"));
result.push(await benchCpp("GaussianBlur"));
result.push(await benchCpp("resize"));
result.push(await benchCpp("stackBlur"));

const firstRunResult = result.map((row) => {
  const times = row.slice(1).map((result) => {
    return result.firstRun.toFixed(3);
  });
  return [row[0], ...times];
});
const firstRunTable = [header, ...firstRunResult];
console.log("firstRun");
console.log(markdownTable(firstRunTable, {
  align: ["l", "r", "r", "r", "r", "r"],
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
  align: ["l", "r", "r", "r", "r", "r"],
}));

Deno.exit(0);
