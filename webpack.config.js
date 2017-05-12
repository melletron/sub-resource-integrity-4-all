const webpack = require('webpack'); //to access built-in plugins
const path = require('path');

const config = {
    entry: {
        "sri4all": "./src/sri4all.js",
        "sha256": "js-sha256",
        "css-check": "./src/css-check.js",
        "js-check": "./src/js-check.js"
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].min.js'
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