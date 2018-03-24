const gracefulFs = require('graceful-fs'),
      glob = require('glob'),
      path = require('path'),
      toml = require('toml-j0.4');

exports.globFiles = (directory, pattern) => {
  return new Promise((resolve, reject) => {
    glob(pattern, { cwd: directory, nodir: true }, (err, files) => {
      if(err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
};

exports.listFiles = async (directory, filterRegex) => {
  return new Promise((resolve, reject) => {
    gracefulFs.readdir(directory, (err, filenames) => {
      if(err) {
        reject(err);
      } else {
        if(filterRegex) {
          filenames = filenames.filter(filename => filename.match(filterRegex));
        }

        const paths = filenames.map(filename => `${directory}/${filename}`);

        resolve(paths);
      }
    });
  });
};

exports.loadFile = async filePath => {
  return new Promise((resolve, reject) => {
    gracefulFs.readFile(filePath, 'utf-8', (err, content) => {
      if(err) {
        reject(err);
      } else {
        try {
          resolve(content);
        } catch(err) {
          reject(err);
        }
      }
    });
  });
};

exports.loadToml = async (directory, tomlPath) => {
  return new Promise((resolve, reject) => {
    gracefulFs.readFile(path.join(directory, tomlPath), 'utf-8', (err, content) => {
      if(err) {
        reject(err);
      } else {
        try {
          const data = toml.parse(content);
          resolve(data);
        } catch(err) {
          reject(err);
        }
      }
    });
  });
};

exports.writeFile = async (filePath, content) => {
  return new Promise((resolve, reject) => {
    gracefulFs.writeFile(filePath, content, err => err ? reject(err) : resolve());
  });
};
