'use strict'
var ExtractTextPlugin = require("extract-text-webpack-plugin")
module.exports = {
	NODE_ENV: '"production"',
  configureWebpack: config => {
    config.output.filename = "[name].js";
    config.plugins.push(new ExtractTextPlugin({
      filename: 'css/[name].css'
    }));
  }
};
// module.exports = {
//   NODE_ENV: '"production"',
//   webpack(defaults, options) {
//     defaults.output.filename = './index.js'
//     defaults.plugins.find(el => {
//       if (el.constructor.name === 'ExtractTextPlugin') {
//         el.filename = './style.css'
//       }
//     })
//     return defaults;
//   }
  // filename: {
  //    js: 'index.js',
  //    css: 'style.css',
  //    assets: 'static/[name].[ext]'
  //  }
// }
