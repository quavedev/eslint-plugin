const DEBUG = !!process.env.METEOR_ESLINT_PLUGIN_DEBUG;

module.exports = {
  debug(...args) {
    if (DEBUG) console.debug(...args);
  },
};
