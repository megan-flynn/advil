module.exports = (env, argv) => {
  const isDevMode =
    (argv && argv.mode === 'development') ||
    process.env.NODE_ENV === 'development' ||
    process.env.NODE_ENV === 'dev';

  const configPath = `./webpack.${isDevMode ? 'dev' : 'prod'}.js`;
  const config = require(configPath);
  return config(env, argv);
};
