const path = require('path');
const fse = require('fs-extra');
const { createConfig } = require('@banez/npm-tool');

module.exports = createConfig({
  bundle: {
    extend: [
      {
        title: 'Remove tests from dist',
        async task() {
          await fse.remove(path.join(process.cwd(), 'dist', 'test'));
        },
      },
    ],
  },
});
