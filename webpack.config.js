const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const sharedConfig = { resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.scss'],
},
module: {
    rules: [
        {
            test: /\.s[ac]ss$/i,
            use: [
                'style-loader',
                {
                    loader: 'css-loader',
                    options: {
                        modules: {
                            localIdentName: '[local]--[hash:base64:5]',
                        },
                    },
                },
                'sass-loader',
            ],
        },
        {
            test: /\.ts(x?)$/,
            exclude: /node_modules/,
            use: [
                {
                    loader: 'ts-loader',
                    options: {
                        configFile: path.join(
                            __dirname,
                            'tsconfig.json',
                        ),
                        // dont compile tests into output
                        // dont compile the just-messing-around file(s) like boot.custom.tsx into output
                        onlyCompileBundledFiles: true,
                    },
                },
            ],
        },
        // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
        {
            enforce: 'pre',
            test: /\.js$/,
            loader: 'source-map-loader',
        },
    ],
}}
function createClientConfig() {
    return {
        ...sharedConfig,
        target: 'web',
        plugins: [
            new CopyPlugin({
                patterns: [
                    { from: './examples/index.html' },
                    { from: './node_modules/react/umd/react.development.js' },
                    { from: './node_modules/react-dom/umd/react-dom.development.js' },
                ],
            }),
        ],
        devtool: 'inline-source-map',
        entry: {
            client: './examples/horizontal.tsx',
        },
        output: {
            path: path.resolve(
                __dirname,
                'dist',
                'public',
            ),
            filename: '[name].js',
        },
        mode: 'development',
        // When importing a module whose path matches one of the following, just
        // assume a corresponding global variable exists and use that instead.
        // This is important because it allows us to avoid bundling all of our
        // dependencies, which allows browsers to cache those libraries between builds.
        externals: {
            'react': 'React',
            'react-dom': 'ReactDOM',
        },
        devServer: {
            port: 3000,
            historyApiFallback: true,
        },
    };
}
function createLibraryConfig() {
    // return webpack config object for building the library
    return {
        ...sharedConfig,
        output: {
            library: {
              name: 'React-split-Pane',
              type: 'umd',
            },
            filename: 'bundle.js',
          },
         
  }
}

module.exports = (
    env,
    args,
) => {
    if (env && env.entryPoint === 'example') {
        return createClientConfig();
    } else {
        return createLibraryConfig();
    }
};