module.exports = {
  build: {
    'assets:style': [
      {
        filename: 'theme.scss',
        sourcemap: true,
        watch: [
          'assets-src/sass/**/*.scss'
        ],
        rtl: true
      },

      {
        filename: 'editor-style.scss',
        sourcemap: true
      }
    ],

    'assets:js': [
      {
        filename: 'theme.js',
        watch: [
          'assets-src/js/**/*.js',
          '!assets-src/js/node_modules/**/*.js'
        ],
        sourcemap: true
      }
    ],

    'customizer:style': [
      {
        filename: 'customizer.scss',
        sourcemap: true,
        watch: [
          'includes/customizer/assets-src/**/*.scss'
        ],
        rtl: true
      }
    ],

    'customizer:js': [
      {
        filename: 'customizer-control.js',
        watch: [
          'includes/customizer/assets-src/js/**/*.js',
          '!includes/customizer/assets-src/js/node_modules/**/*.js'
        ],
        sourcemap: true
      },

      {
        filename: 'customizer-preview.js',
        watch: [
          'includes/customizer/assets-src/js/**/*.js',
          '!includes/customizer/assets-src/js/node_modules/**/*.js'
        ],
        sourcemap: true
      }
    ]
  }
}

