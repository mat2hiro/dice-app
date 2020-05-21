export default {
  mode: 'universal',
  /*
   ** Headers of the page
   */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || ''
      }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },

  router: {
    middleware: ['authenticated']
  },
  /*
   ** Global CSS
   */
  css: ['firebaseui/dist/firebaseui.css', '~/assets/scss/style.scss'],
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: ['@nuxt/typescript-build'],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://bootstrap-vue.js.org
    'bootstrap-vue/nuxt',
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    // pwa support
    '@nuxtjs/pwa'
  ],
  /*
   ** Bootstrap Vue configuration
   */
  bootstrapVue: {
    componentPlugins: [
      // 'ButtonPlugin',
      // 'LayoutPlugin',
      // 'FormPlugin',
      // 'FormCheckboxPlugin',
      // 'FormInputPlugin',
      // 'FormRadioPlugin',
      'ToastPlugin',
      'ModalPlugin'
    ],
    directivePlugins: [
      'VBPopoverPlugin',
      'VBTooltipPlugin',
      'VBScrollspyPlugin'
    ]
  },
  /*
   ** nuxt pwa configuration
   */
  manifest: {
    name: 'Dice',
    title: 'Dice',
    description:
      'You can throw dice and everyone joining boards can see the results.',
    lang: 'ja',
    theme_color: '#eee',
    background_color: '#fff',
    display: 'standalone'
  },

  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {},
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {},
    vendor: ['firebaseui']
  }
}
