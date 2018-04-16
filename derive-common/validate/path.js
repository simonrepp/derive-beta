module.exports = ({ value }) => ({
  normalizedPath: value.replace(/^\//, '').normalize()
});
