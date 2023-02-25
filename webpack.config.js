const path = require("path");
// defining flags which are used in settings based on what script is running
const mode = process.env.NODE_ENV === "development";
const modeReverse = !mode;

// plugin that allow to use our own html file instead of creating it automatically
const HTMLwebpackPlugin = require("html-webpack-plugin");
// plugin that make a css file instead of making style tag in prod html file
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// minimizing css plugin
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
// minimizing js plugin
const TerserWebpackPlugin = require("terser-webpack-plugin");
// plugin to use HotReaload properly
const webpack = require("webpack");
// analyzer, def prot is 8888
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

module.exports = {
	// defining entry points and setting resulting directory
	context: path.resolve(__dirname, "src"),
	entry: "./application.js",
	output: {
		filename: "bundle.js",
		path: path.resolve(__dirname, "dist"),
	},
	// allowded file extensions to make src paths easier
	resolve: {
		extensions: [".js", ".css", ".scss", ".jsx", ".svg"],
	},
	// defining that our code should be minimized only in prod mode
	optimization: {
		minimize: modeReverse,
		minimizer: [new CssMinimizerPlugin(), new TerserWebpackPlugin()],
	},
	module: {
		// defining that our code files will go thru babel so our code will be more universal
		rules: [
			//! SO BASICALLY WE HAVE TO WAYS OR USE BBABEL OR GO W/ ESBUILD WHICH I TESTED OUT - ESBULD DO THE SAME THINGS BUT FATSER
			/*
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            }, */
			{
				// Match js, jsx, ts & tsx files
				test: /\.[jt]sx?$/,
				loader: "esbuild-loader",
				options: {
					// cuz bydef js files cannot understand jsx in esbuild
					loader: "jsx",
					// JavaScript version to compile to
					target: "es2015",
				},
			},
			// defining how to handle css-ish files
			{
				test: /\.css$/,
				use: [MiniCssExtractPlugin.loader, "css-loader"],
			},
			{
				test: /\.s[ac]ss$/,
				use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
			},
			// this one's is replace for old file/url loaders
			// cuz of it we can use defined file extensions w/o concerns
			// if some files required - add specific extension
			{
				test: /\.(svg|png|jpe?g|gif)$/,
				type: "asset/inline",
			},
			{
				test: /\.(png|jpe?g|gif|svg)$/i,
				type: "asset/resource",
			},
			/* it is to make src files come to dist folder
            {
                "test": /\.(png|jpe?g|gif|svg)$/i,
                "type": "asset/source",
            },
            */
		],
	},
	plugins: [
		// we saying what file we using and also mentioning that we minimizing it
		new HTMLwebpackPlugin({
			template: "./index.html",
			minify: {
				collapseWhitespace: modeReverse,
			},
		}),
		// define plugin thath make exact css file in prod
		new MiniCssExtractPlugin(),
		// define hotreload plugin
		new webpack.HotModuleReplacementPlugin(),
		// define bundle analyzer
		new BundleAnalyzerPlugin(),
	],
	// define source map for proper navigating
	devtool: "source-map",
	// dev server settings
	devServer: {
		hot: mode,
		historyApiFallback: false,
		open: true,
		compress: true,
		static: {
			directory: path.join(__dirname, "dist"),
		},
	},
};
