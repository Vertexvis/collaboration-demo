module.exports = {
  eslint: { ignoreDuringBuilds: true },
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
