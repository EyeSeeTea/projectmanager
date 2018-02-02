var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');

module.exports = {
    entry: './app.js',
    output: {
        filename: '[name].[chunkhash].js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'index.html',
            filename: 'index.html',
            inject: 'head'
        }),
        new AddAssetHtmlPlugin([{
            filepath: require.resolve('./node_modules/jquery/dist/jquery.min'),
            includeSourcemap: false
        },{
            filepath: require.resolve('./node_modules/file-saver/FileSaver.min'),
            includeSourcemap: false
        },{
            filepath: require.resolve('./node_modules/jszip/dist/jszip.min.js'),
            includeSourcemap: false
        }])
    ],
    module: {
        rules: [
            {
                test: /\.js?$/,
                use: [ 'babel-loader?presets[]=es2015' ],
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            },
            {
                test: /\.ts?$/,
                use: [ 'babel-loader?presets[]=es2015', 'ts-loader' ],
                exclude: /node_modules/
            },
            {
                test: /\.html$/,
                use: [ {
                    loader: 'html-loader',
                    options: {
                        minimize: true
                    }
                }]
            },
            {
                test: /\.png$/,
                use: [ "url-loader?mimetype=image/png" ]
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                use: [ 'file-loader?name=public/fonts/[name].[ext]' ]
            }

        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    }
};