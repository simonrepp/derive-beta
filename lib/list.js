const path = require('path');
const remote = require('remote');

module.exports = async (data, collection, filename) => {
  const temporaryPath = path.join(remote.app.getPath('temp'), filename);
  const editor = await atom.workspace.open(temporaryPath, { split: 'right' });

  if(collection.match(/categories|tags/)) {
    editor.setText(Array.from(data[collection].values()).map(entry => entry.name).sort().join('\n'));
  } else if(collection.match(/players/)) {
    editor.setText(Array.from(data.players.values()).map(player => player.name).sort().join('\n'));
  } else if(collection.match(/issues/)) {
    editor.setText(Array.from(data.issues.values())
                        .map(issue => issue.number)
                        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).join('\n'));
  } else {
    editor.setText(Array.from(data[collection].values()).map(document => document.title).sort().join('\n'));
  }

  editor.setCursorScreenPosition([0, 0]);
  editor.save();
};
