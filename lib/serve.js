const { BufferedNodeProcess } = require('atom'),
      path = require('path');

const urlRegex = /http:\/\/(?:(?!127)\d){1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{4,5}/;

const exit = (data, code, serverProcess) => {
  data[serverProcess] = null;

  if(code !== 0) {
    atom.notifications.addError(
      '**dérive**\n\nProblem: Einer der Hintergrundprozesse die ermöglichen die Seite lokal auf diesem Computer im Browser zu testen ist abgestürzt.',
      {
        buttons: [{
          onDidClick: () => {
            const editorElement = atom.views.getView(atom.workspace.getActiveTextEditor());
            atom.commands.dispatch(editorElement, 'window:reload');
          },
          text: 'Atom neu starten'
        }],
        detail: 'Lösung: Zunächst sollte Atom neu gestartet werden, dadurch wird eine neue Instanz des Hintergrundprozesses gestartet.',
        description: 'Wenn der Netzwerkport (die vierstellige Nummer in zb. *http://localhost:2000*) weiterhin blockiert ist, kann es sein dass auch ein Neustart von Atom das Problem nicht löst, in diesem Fall hilft ein Neustart des Computers, da dadurch sämtliche Ports wieder frei werden.',
        dismissable: true
      }
    );
  }
};

const stdout = (data, output, serverUrl) => {
  const match = output.match(urlRegex);

  if(match) {
    data[serverUrl] = match[0];
  }
};

module.exports = data => {
  const packagePath = atom.packages.resolvePackagePath('derive-beta');
  const httpServerPath = path.join(packagePath, '/node_modules/http-server/bin/http-server');

  data.buildServerProcess = new BufferedNodeProcess({
    command: httpServerPath,
    args: [data.buildDir, '-c-1'],
    stderr: output => console.log(output),
    stdout: output => stdout(data, output, 'buildServerUrl'),
    exit: code => exit(data, code, 'buildServerProcess')
  });

  setTimeout(() => {
    data.rootServerProcess = new BufferedNodeProcess({
      command: httpServerPath,
      args: [data.root, '-c-1'],
      stderr: output => console.log(output),
      stdout: output => stdout(data, output, 'rootServerUrl'),
      exit: code => exit(data, code, 'rootServerProcess')
    });
  }, 250);
};
