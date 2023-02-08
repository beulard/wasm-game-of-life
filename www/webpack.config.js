const CopyWebpackPlugin = require("copy-webpack-plugin");
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const path = require('path');

module.exports = {
    entry: "./bootstrap.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bootstrap.js",
    },
    mode: "development",
    plugins: [
        new WasmPackPlugin({
            crateDirectory: path.resolve(__dirname, "../"),
            outDir: path.resolve(__dirname, "pkg"),
            outName: "wasm_game_of_life",
        }),
        new CopyWebpackPlugin({
            patterns: [
                'index.html'
            ]
        }),
    ],
    experiments: {
        asyncWebAssembly: true
    }
};
