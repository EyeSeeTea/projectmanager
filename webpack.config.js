var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin');

module.exports = {
    entry: './app.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            "window.jQuery": 'jquery'
        }),
        new HtmlWebpackPlugin({
            template: 'index.html',
            filename: 'index.html',
            inject: 'head'
        }),
        new AddAssetHtmlPlugin({
            filepath: require.resolve('./node_modules/jquery/dist/jquery.min'),
            includeSourcemap: false
        })
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
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
    }
};