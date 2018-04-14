module.exports = {
  hierarchyLayerSkip: data => {
    const {
      currentDepth,
      currentDepthBeginLine,
      currentDepthBeginLineContent,
      errorLine,
      errorLineContent,
      targetDepth
    } = data;

    return `In Zeile ${errorLine} wird mit "${errorLineContent}" eine neue ` +
           `Untersektion des Dokuments begonnen, die zwei Ebenen tiefer ` +
           `liegt (${'#'.repeat(targetDepth)}) als die aktuelle ` +
           `(${'#'.repeat(currentDepth)}) welche in Zeile ` +
           `${currentDepthBeginLine} mit "${currentDepthBeginLineContent}" ` +
           `begonnen wurde, es darf jedoch immer nur eine Untersektion ` +
           `begonnnen werden die maximal eine Ebene tiefer geht.`;
  },
  invalidLine: data => {
    const { errorLine, errorLineContent } = data;

    return `Die Zeile ${errorLine} folgt mit dem Inhalt ` +
           `"${errorLineContent}" keinem erlaubten Muster.`;
  },
  unexpectedValue: data => {
    const { errorLine, errorLineContent } = data;

    return `Die Zeile ${errorLine} enthält einen Wert ` +
           `("${errorLineContent}"), ohne dass in einer der Zeilen davor ` +
           `ein dazugehöriger Schlüssel angegeben wurde.`;
  },
  unterminatedMultilineValue: data => {
    const {
      multiLineValueBeginLine,
      multiLineValueBeginLineContent
    } = data;

    return `Der mehrzeilige Textblock der in Zeile ${multiLineValueBeginLine} ` +
           `mit "${multiLineValueBeginLineContent}" beginnt, wird bis zum ` +
           `Ende des Dokuments nicht beendet. (Die abschliessende Zeile ` +
           `"${multiLineValueBeginLineContent}" nach dem Textblock fehlt)`;
  }
};
