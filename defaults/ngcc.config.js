module.exports = {
  packages: {
    '@clr/angular': {
      ignorableDeepImportMatchers: [
        /@cds\/core\//,
      ]
    },
    '@cds/angular': {
      ignorableDeepImportMatchers: [
        /@cds\/core\//,
      ]
    },
  },
};