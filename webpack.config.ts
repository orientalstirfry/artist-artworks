import path from 'path';
import webpack from 'webpack';

const webpackConfig : webpack.Configuration = {
    mode: 'production',
    entry: './src/artist-artworks.ts',
    devtool: 'source-map',
    resolve: {
      extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    },
    output: {
      libraryTarget: 'commonjs',
      path: path.join(__dirname, 'dist'),
      filename: 'artist-artworks.js'
    },
    target: 'node',
    module: {
      rules: [
        // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
        { test: /\.tsx?$/, loader: 'ts-loader' },
      ],
    },
};

export default webpackConfig;