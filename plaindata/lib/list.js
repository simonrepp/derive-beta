class PlainDataList {
  constructor(list) {
    this.keyRange = list.keyRange;
    this.range = list.range;
    this.touched = false;
    this.values = [];
  }

  append(value) {
    value.context = this.context;
    value.key = this.key;
    value.parent = this;

    this.values.push(value);

    this.extendRange(value.range.endLine, value.range.endColumn);
  }

  extendRange(line, column) {
    this.range.endColumn = column;
    this.range.endLine = line;

    this.parent.extendRange(line, column);
  }

  raw() {
    return this.values.map(value => value.get());
  }

  touch() {
    this.touched = true;

    for(let value of this.values) {
      value.touch();
    }
  }
}

module.exports = PlainDataList;
