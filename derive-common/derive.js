module.exports = data => {
  data.derivePages = Array.from(data.pages.values()).filter(page => page.urbanize === null);
};
