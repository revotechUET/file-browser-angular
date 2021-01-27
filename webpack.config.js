let path = require('path');
//let webpack = require('webpack');

const OUTPUT = path.join(__dirname, 'dist');
// const OUTPUT = path.join(__dirname, '../i2g-data-administrator/dist/bower_components/file-explorer/dist');

module.exports = {
    // mode: "development",
    entry: [
        './client/components/file-explorer/file-explorer.js'
        ,'./node_modules/pdfjs-dist/build/pdf.worker.entry.js',
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
                test: /\.(png|gif|svg)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: '../../img/'
                        //outputPath: 'img/',
                    },
                },
            },
        ],
    },
    plugins: [
    ],
    resolve: {
        // alias: {
        //     'vue$': 'vue/dist/vue.esm.js',
        // }
    }
};
// webpack.config.js
// module.exports = (env, argv) => {
//     const config = Object.assign({}, generalConfig, {
//         mode: argv.mode,
//         devtool: argv.devtool
//     });
//     return config;
// };
