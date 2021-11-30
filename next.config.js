module.exports = {
  swcMinify: true,
  webpack: (config) => {
    config.output.assetModuleFilename = `static/[hash][ext]`;
    config.output.publicPath = `/_next/`;
    config.module.rules.push({
      test: /\.worker.js/,
      type: `asset/resource`,
    });
    return config;
  },
};
