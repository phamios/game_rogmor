const { version } = require('./package.json');

module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  publicRuntimeConfig: {
    version,
  },
}