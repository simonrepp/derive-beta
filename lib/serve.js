const { BufferedNodeProcess } = require('atom'),
      path = require('path');

module.exports = data => {
  const packagePath = atom.packages.resolvePackagePath('derive-beta');
  const httpServerPath = path.join(packagePath, '/node_modules/http-server/bin/http-server');

  const httpServer = new BufferedNodeProcess({
    command: httpServerPath,
    args: [data.buildDir, '-p', '8223'],
    stdout: output => console.log(output),
    exit: code => {
      data.serverProcess = null;

      if(code !== 0) {
        atom.notifications.addError(
          '**dérive**\n\nProblem: Der Hintergrundprozess der ermöglicht die Seite lokal auf diesem Computer im Browser zu testen ist abgestürzt.',
          {
            buttons: [{
              onDidClick: () => {
                editorElement = atom.views.getView(atom.workspace.getActiveTextEditor());
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
    }
  });

  data.serverProcess = httpServer;
};
