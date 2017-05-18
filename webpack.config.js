var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: './app.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
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