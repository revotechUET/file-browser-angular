let path = require('path');

const OUTPUT = path.join(__dirname, 'dist');

/**
 * @type {import('webpack').Configuration}
 */
const common = {
    mode: "development",
    entry: {
        'file-explorer-module': './client/components/file-explorer/file-explorer.js'
    },
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
    externals: {
        angular: 'angular',
        '@revotechuet/misc-component-vue': '@revotechuet/misc-component-vue',
    },
};

/**
 * @type {import('webpack').Configuration[]}
 */
module.exports = [
    {
        ...common,
        output: {
            ...common.output,
            filename: '[name].js',
            library: {
                type: 'umd',
            },
        },
    },
    {
        ...common,
        output: {
            ...common.output,
            filename: '[name].mjs',
            library: {
                type: 'module',
            },
            module: true,
            environment: {
                module: true,
            },
        },
        experiments: {
            outputModule: true,
        },
    },
]