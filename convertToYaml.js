
const fs = require('fs'),
  path = require('path'),
  yaml = require('js-yaml');

const files = fs.readdirSync(path.join(__dirname, '/ml-100k/'));

const createYml = function(name) {
  const newFileURL = path.join(__dirname, `/ml-100k/yaml/${name}.yaml`);
  const newContent = [];
  const data = fs.readFileSync(path.join(__dirname, `/ml-100k/${name}`), { encoding : 'utf8'}).toString().split('\n').forEach(function(line){
    const cleanLine = line.replace(/\t/g, ' ');
    const arr = cleanLine.split(" ");
    newContent.push(arr);
  });
  const yamlContent = yaml.safeDump(newContent);
  fs.writeFileSync(newFileURL, yamlContent, 'utf-8');
}

for (i in files) {
  const name = files[i];
  const match = /.*\.(base|test)$/.test(name);
  if (match) { createYml(name); }
}

