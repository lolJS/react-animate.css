const webpack = require('webpack'); // eslint-disable-line import/no-extraneous-dependencies
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const ReactAnimateEnv = process.env.REACT_ANIMATE_WEBPACK;

const config = {
  entry: ['./src/index.js'],
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '',
    filename: 'react-animate.css.js',
    library: 'ReactAnimateCss',
    libraryTarget: 'umd',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [path.resolve('src')],
        use: {
          loader: 'babel-loader',
          options: { 
            presets: [
              ["es2015", { modules: false, loose: true }],
              "react"
            ],
            plugins: [
              'syntax-dynamic-import',
              'transform-react-remove-prop-types',
              'transform-react-constant-elements',
              'transform-react-inline-elements'
            ]
          }
        },
        exclude: [/node_modules/, /\.test\.js/],
      }
    ],
  },
  performance: {
    hints: "warning", // enum
    maxAssetSize: 200000, // int (in bytes),
    maxEntrypointSize: 400000, // int (in bytes)
    assetFilter: function(assetFilename) {
      // Function predicate that provides asset filenames
      return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
    }
  }
};


if (process.env.NODE_ENV === 'production') {
  // config.plugins.push(new webpack.optimize.UglifyJsPlugin({
  //   sourceMap: true
  // }));

  // config.module.rules.push(...[{
  //   test: /\.js$/,
  //   use: 'babel-loader',
  //   exclude: [/node_modules/, /index\.demo\.js/, /\.test\.js/, /app\.js/],
  // }]);

  config.externals = [
    {
      react: {
        root: 'React',
        commonjs2: 'react',
        commonjs: 'react',
        amd: 'react',
      },
    },
  ];

  config.output.filename = config.output.filename.replace(/\.js$/, '.min.js');
}

if (ReactAnimateEnv === 'server' || ReactAnimateEnv === 'demo') {
  config.entry = './src/index.demo.js';

  config.plugins = [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new HtmlWebpackPlugin({
      title: 'React Animate.css',
      template: './index.ejs',
      env: ReactAnimateEnv === 'demo' ? 'production' : null,
    }),
    new ExtractTextPlugin({
			filename: "style.css"
		}),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      mangle: true,
      compress: {
        warnings: false, // Suppress uglification warnings
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        screw_ie8: true
      },
      output: {
        comments: false,
      },
      exclude: [/\.min\.js$/gi] // skip pre-minified libs
    })
  ];
  
  console.info(config.plugins);
  
  config.devServer = {
    contentBase: path.join(__dirname, 'dist'), // boolean | string | array, static file location
    compress: true, // enable gzip compression
    historyApiFallback: true, // true for index.html upon 404, object for multiple paths
    hot: false, // hot module replacement. Depends on HotModuleReplacementPlugin
    https: false, // true for self-signed, object for cert authority
    noInfo: true, // only errors & warns on hot reload
  };

  if (ReactAnimateEnv !== 'demo') {
    [].push.apply(config.module.rules,
      [
        { 
          test: /\.css$/, 
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                minimize: false,
                modules: false,
                importLoaders: 1,
                // localIdentName: '[hash:base64:5]',
              }
            }
          ]
        }, 
        { test: /\.svg$/, use: 'url-loader' },
        { test: /\.woff$/, use: 'url-loader' },
        { test: /\.ttf$/, use: 'url-loader' },
        { test: /\.eot$/, use: 'url-loader' }
      ]);
  }
  else {
    [].push.apply(config.module.rules,
      [
        { 
          test: /\.css$/, 
          use: ExtractTextPlugin.extract({
  					fallback: "style-loader",
  					use: "css-loader"
  				})
        }, 
        { test: /\.svg$/, use: 'url-loader' },
        { test: /\.woff$/, use: 'url-loader' },
        { test: /\.ttf$/, use: 'url-loader' },
        { test: /\.eot$/, use: 'url-loader' }
      ]);
  }
}

module.exports = config;
