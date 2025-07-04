export const svgrOptions = {
  exportType: 'named',
  namedExport: 'ReactComponent',
  titleProp: true,
  ref: true,
  svgoConfig: {
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            removeViewBox: false,
            removeUselessStrokeAndFill: false,
            cleanupIds: false,
            removeUnknownsAndDefaults: false,
          },
        },
      },
    ],
  },
};
