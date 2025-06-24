const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  // ...other webpack config (entry, output, etc.)
  output: {
    path: path.resolve(__dirname, 'out'),
    // ...other output options
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/blogs', to: 'blogs' }
      ]
    })
  ]
};