module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          esmodules: true
        }
      }
    ],
    '@babel/react'
  ],

  plugins: ['@babel/plugin-proposal-class-properties']
};
