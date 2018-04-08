const { BufferedNodeProcess } = require('atom'),
      path = require('path');

const urlRegex = /http:\/\/(?:(?!127)\d){1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{4,5}/;

const exit = (data, code) => {
  data.serverProcess = null;

  if(code !== 0) {
    atom.notifications.addError(
      '**dérive**\n\nProblem: Der Hintergrundprozess der ermöglicht die Seite lokal auf diesem Computer im Browser zu testen ist abgestürzt.',
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

const stdout = (data, output) => {
  const match = output.match(urlRegex);

  if(match) {
    console.log(`Server running at ${match[0]}`);
    data.serverUrl = match[0];
  }
};

module.exports = data => {
  const packagePath = atom.packages.resolvePackagePath('derive-beta');
  const httpServerPath = path.join(packagePath, '/node_modules/http-server/bin/http-server');

  const httpServer = new BufferedNodeProcess({
    command: httpServerPath,
    args: [data.buildDir],
    stderr: output => console.log(output),
    stdout: output => stdout(data, output),
    exit: code => exit(data, code)
  });

  data.serverProcess = httpServer;
};
