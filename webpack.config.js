let path = require('path');
let webpack = require('webpack');
let OUTPUT = path.join(__dirname, 'public');

module.exports = {
    mode: 'development',
    // mode: 'production',
    devtool: 'inline-sourcemap',
    entry: [
        './client/components/file-explorer/file-explorer.js'
    ],
    output: {
        path: OUTPUT,
        filename: 'file-explorer-module.js',
    },
    module: {
        rules: [
            { test: /\.css$|\.less$/, use: ['style-loader', 'css-loader', 'less-loader'] },
            { test: /\.html$/, use: 'html-loader' },
            {
                test: /\.png$|\.gif$/, use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'img/'
                    }
                }
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        })
    ]
}