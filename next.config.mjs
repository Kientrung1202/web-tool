/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: false,
  webpack: (config, { dev, webpack }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ["**/._*", "**/.DS_Store"]
      };
    }

    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /(^|\/)\._/
      })
    );

    return config;
  }
};

export default nextConfig;
