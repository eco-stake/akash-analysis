const { version } = require("./package.json");
const withPWA = require("next-pwa");
const { withSentryConfig } = require("@sentry/nextjs");

const isDev = process.env.NODE_ENV === "development";

const moduleExports = {
  pwa: {
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: isDev
  },
  reactStrictMode: false,
  compiler: {
    // Enables the styled-components SWC transform
    styledComponents: true
  },
  experimental: {
    outputStandalone: true
  },
  publicRuntimeConfig: {
    version
  },
  i18n: {
    locales: ["en-US"],
    defaultLocale: "en-US"
  }
};

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs,
  dryRun: true,
  release: require("./package.json").version
  // org: "akashlytics",
  // project: "cloudmos-explorer"

  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = withPWA(withSentryConfig(moduleExports, sentryWebpackPluginOptions));
