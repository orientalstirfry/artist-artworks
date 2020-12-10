import path from 'path';
import webpack from 'webpack';

const webpackConfig : webpack.Configuration = {
  entry: './src/artist-artworks.ts',
  output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'artist-artworks.js'
  },
  resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json']
  },
  module: {
      rules: [{
          // Include ts, tsx, js, and jsx files.
          test: /\.(ts|js)x?$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
      }],
  }
};

export default webpackConfig;