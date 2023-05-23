const path = require('path');

module.exports = {
  entry: './fetch-data.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(process.cwd(), 'dist'),
  },
  mode: 'production',
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json"],
    fallback: {
      fs: false,
      path: require.resolve('path-browserify'),
      os: require.resolve('os-browserify/browser'),
    },
  },
};