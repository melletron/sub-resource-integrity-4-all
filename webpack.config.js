const webpack = require('webpack'); //to access built-in plugins
const path = require('path');

const config = {
    entry: {
        "css-check": "./src/css-check.js",
        "js-check": "./src/js-check.js"
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {test: /\.(js|jsx)$/, use: 'babel-loader'}
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin()
    ]
};

module.exports = config;