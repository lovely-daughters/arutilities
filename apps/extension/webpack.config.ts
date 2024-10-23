import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import { Configuration } from "webpack";

const config: Configuration = {
  entry: {
    background: path.resolve("src", "background.ts"),
    // hotReload: path.resolve("src", "reload.ts"),
    twitter: path.resolve("src", "content-scripts", "twitter-2cp.ts"),
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.(ts|js)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-typescript"],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  plugins: [
    // new HtmlWebpackPlugin({
    //   template: path.join(__dirname, "public", "index.html"),
    // }),
    // new BundleAnalyzerPlugin({ openAnalyzer: false }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "manifest.json"),
          to: path.resolve(__dirname, "build", "manifest.json"),
        },
        {
          from: path.resolve(__dirname, "src", "static"),
          to: path.resolve(__dirname, "build"),
        },
      ],
    }),
  ],
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name].js",
  },
  devtool: "inline-source-map",
};

export default config;
