const path = require('path'),
      { spawn } = require('child_process');

module.exports = data => {
  const packagePath = atom.packages.resolvePackagePath('derive-beta');
  const httpServerPath = path.join(packagePath, '/node_modules/http-server/bin/http-server');
  
  const httpServer = spawn(httpServerPath, [data.buildDir, '-p', '2018']);
  
  httpServer.stdout.on('data', data => console.log(data.toString()));
  httpServer.stderr.on('data', data => console.log(data.toString()));
  
  httpServer.on('close', (code, signal) => {
    if(code !== 0) {
      atom.notifications.addError(
        '**derive**\n\nProblem: Der Hintergrundprozess der ermöglicht die Seite lokal auf diesem Computer im Browser zu testen ist abgestürzt.',
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
  });
  
  return httpServer;
};
