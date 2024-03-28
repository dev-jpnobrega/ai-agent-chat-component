import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';	

export const config: Config = {
  namespace: 'ai-enterprise-chat-component',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      dir: 'public',
      serviceWorker: null, // disable service workers
      copy: [
        { src: 'assets/translate/*.json', dest: 'assets/translate' },
      ]
    },
  ],
  testing: {
    browserHeadless: "new",
  },
  plugins: [
    sass()
  ]
};
