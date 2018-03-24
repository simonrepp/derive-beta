// TODO: Remove this unless there is a strong necessity for this feature
//       Consider that php aka search does not work locally!

const path = require('path'),
      { spawn } = require('child_process');

module.exports = () => {
  const server = spawn('http-server', [data.buildDir, '-p', '2000', '-c-1']);

  server.stdout.on('data', (data) => { console.log(data.toString()) });
  server.stderr.on('data', (data) => { console.log(data.toString()) });

  server.on('close', (code, signal) => {
    console.log('server closed');
    // if(code === 0) {
    //   resolve();
    // }
  });
};
