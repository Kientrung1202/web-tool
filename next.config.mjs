import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

/** @type {(phase: string) => import('next').NextConfig} */
const nextConfig = (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  const config = {
    output: isDev ? undefined : "export",
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

  if (isDev) {
    config.rewrites = async () => [
      {
        source: "/api/convert/:path*",
        destination: "http://127.0.0.1:3001/api/convert/:path*"
      }
    ];
  }

  return config;
};

export default nextConfig;
