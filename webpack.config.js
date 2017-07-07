const webpack = require('webpack'); // eslint-disable-line import/no-extraneous-dependencies
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const ReactAnimateEnv = process.env.REACT_ANIMATE_WEBPACK;

const config = {
  entry: { app: './src/index.js' },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '',
    filename: 'react-animate.css.[id].js',
    crossOriginLoading: 'anonymous',
    library: 'ReactAnimateCss',
    libraryTarget: 'umd',
    chunkFilename: '[id].js',
  },
  target: 'web',
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
              ['es2015', { modules: false, loose: true }],
              'react',
            ],
            plugins: [
              'syntax-dynamic-import',
              ['transform-react-remove-prop-types', {
                removeImport: true,
              }],
              'transform-react-constant-elements',
              'transform-react-inline-elements',
            ],
          },
        },
        exclude: [/node_modules/, /\.test\.js/],
      },
    ],
  },
  resolve: {
    modules: [
      'node_modules',
      path.resolve(__dirname, 'app'),
    ],
    extensions: ['.js', '.json', '.css'],
  },
  performance: {
    hints: 'warning', // enum
    maxAssetSize: 200000, // int (in bytes),
    maxEntrypointSize: 400000, // int (in bytes)
    assetFilter(assetFilename) {
      // Function predicate that provides asset filenames
      return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
    },
  },
};


if (process.env.NODE_ENV === 'production' || ReactAnimateEnv === 'demo') {
  config.entry = { app: './src/index.js', vendor: 'react-addons-css-transition-group' };
  config.devtool = false;
  config.module.rules[0].exclude.push(/\.demo\.js/);

  config.plugins = [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
    }),
    new webpack.optimize.CommonsChunkPlugin({
      filename: 'common.js',
      children: true,
      minSize: 1000,
    }),
    new webpack.optimize.AggressiveSplittingPlugin({
      minSize: 20000,
      maxSize: 30000,
    }),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      beutify: false,
      mangle: {
        screw_ie8: true,
        keep_fnames: true,
      },
      compress: {
        warnings: false, // Suppress uglification warnings
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        screw_ie8: true,
      },
      output: {
        comments: false,
      },
      exclude: [/\.min\.js$/gi], // skip pre-minified libs
    }),
  ];

  config.externals = [
    {
      react: {
        root: 'React',
        commonjs2: 'react',
        commonjs: 'react',
        amd: 'react',
      },
      'react-dom': {
        root: 'ReactDOM',
        commonjs2: 'react-dom',
        commonjs: 'react-dom',
        amd: 'react-dom',
        umd: 'react-dom',
      },
    },
  ];
}

if (ReactAnimateEnv === 'server' || ReactAnimateEnv === 'demo') {
  config.entry = './src/index.demo.js';

  [].push.apply(config.plugins, [
    new HtmlWebpackPlugin({
      title: 'React Animate.css',
      template: './index.ejs',
      env: ReactAnimateEnv === 'demo' ? 'production' : null,
    }),
    new ExtractTextPlugin({
      filename: 'style.css',
    }),
  ]);

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
              },
            },
          ],
        },
        { test: /\.svg$/, use: 'url-loader' },
        { test: /\.woff$/, use: 'url-loader' },
        { test: /\.ttf$/, use: 'url-loader' },
        { test: /\.eot$/, use: 'url-loader' },
      ]);
  } else {
    [].push.apply(config.module.rules,
      [
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: 'css-loader',
          }),
        },
        { test: /\.svg$/, use: 'url-loader' },
        { test: /\.woff$/, use: 'url-loader' },
        { test: /\.ttf$/, use: 'url-loader' },
        { test: /\.eot$/, use: 'url-loader' },
      ]);
  }

  config.devServer = {
    contentBase: path.join(__dirname, 'dist'), // boolean | string | array, static file location
    compress: true, // enable gzip compression
    historyApiFallback: true, // true for index.html upon 404, object for multiple paths
    hot: false, // hot module replacement. Depends on HotModuleReplacementPlugin
    https: false, // true for self-signed, object for cert authority
    noInfo: true, // only errors & warns on hot reload
  };
}

module.exports = config;
