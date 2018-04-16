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

    return `In line ${errorLine} "${errorLineContent}" starts a new ` +
           `subsection of the document, which lies two levels deeper ` +
           `(${'#'.repeat(targetDepth)}) than the current section level ` +
           `(${'#'.repeat(currentDepth)}) which was begun in line ` +
           `${currentDepthBeginLine} with "${currentDepthBeginLineContent}", ` +
           `however you can always only start a subsection one level` +
           `deeper than the current one.`;
  },
  invalidLine: data => {
    const { errorLine, errorLineContent } = data;

    return `Line number ${errorLine} with its content ` +
           `"${errorLineContent}" follows no permitted pattern.`;
  },
  unexpectedValue: data => {
    const { errorLine, errorLineContent } = data;

    return `The line ${errorLine} contains a value ` +
           `("${errorLineContent}"), without any line before it specifying ` +
           `an accompanying key first.`;
  },
  unterminatedMultilineValue: data => {
    const {
      multiLineValueBeginLine,
      multiLineValueBeginLineContent
    } = data;

    return `The multiline textblock started in line ${multiLineValueBeginLine} ` +
           `with "${multiLineValueBeginLineContent}" is not terminated ` +
           `until the end of the document. (The terminating line ` +
           `"${multiLineValueBeginLineContent}" after the textblock is missing)`;
  },
  validation: {
    missingKey: key => {
      return `Missing key "${key}" - If the key was provided look out for ` +
             `potential typos and also observe correct case in your spelling.`;
    },
    missingValue: key => {
      return `There needs to be a value provided for key "${key}".`;
    }
  }
};
