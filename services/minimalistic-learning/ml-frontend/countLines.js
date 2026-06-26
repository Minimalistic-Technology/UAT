const fs = require("fs");
const path = require("path");

function getFiles(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getFiles(fullPath, filesList);
    } else if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts")) {
      filesList.push(fullPath);
    }
  }
  return filesList;
}

const allFiles = getFiles("./src");
const linesCounts = allFiles.map((file) => {
  const content = fs.readFileSync(file, "utf-8");
  return { file, lines: content.split("\n").length };
});

linesCounts.sort((a, b) => b.lines - a.lines);
console.log(linesCounts.slice(0, 5));
