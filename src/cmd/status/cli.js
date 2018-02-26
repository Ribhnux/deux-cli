const url = require('url')
const chalk = require('chalk')
const execa = require('execa')
const slugify = require('node-slugify')

const CLI = global.deuxcli.require('main')
const {finish, colorlog} = global.deuxhelpers.require('logger')
const {dirlist, filelist} = global.deuxhelpers.require('util/file')
const {featureTypes, featureLabels} = global.deuxcmd.require('add/cli/fixtures')

class StatusCLI extends CLI {
  constructor(options) {
    super()
    this.status = []
    this.sassCount = 0
    this.theme = undefined
    this.details = undefined
    this.init(options)
  }

  prepare() {
    this.theme = this.themeInfo()
    this.details = this.themeDetails()

    for (const i in this.theme.asset.sass) {
      if (Object.prototype.hasOwnProperty.call(this.theme.asset.sass, i)) {
        this.sassCount += this.theme.asset.sass[i].length
      }
    }

    this.$title = `Your current project is {${this.details.name}}`
  }

  action() {
    execa('git', ['remote', 'get-url', 'origin'], {cwd: this.currentThemePath()}).then(output => {
      let gitUrl = url.parse(output.stdout)
      delete gitUrl.auth

      gitUrl = url.format(gitUrl)

      this.status.push({
        label: 'Theme URI',
        value: this.details.uri,
        tab: 2
      })

      if (gitUrl) {
        this.status.push({
          label: 'Repository URL',
          value: gitUrl,
          tab: 1
        })
      }

      this.status.push({
        label: 'Path',
        value: this.currentThemePath(),
        tab: 3
      })

      this.status.push({
        label: 'Author',
        value: this.details.author,
        tab: 2
      })

      this.status.push({
        label: 'Author URI',
        value: this.details.authorUri,
        tab: 2
      })

      this.status.push({
        label: 'Version',
        value: this.details.version,
        tab: 2
      })

      this.status.push({
        label: 'Templates',
        value: filelist(this.currentThemePath('page-templates')).length,
        suffix: 'Page Templates',
        tab: 2
      })

      this.status.push({
        label: '',
        value: dirlist(this.currentThemePath('partial-templates'))
          .map(dir => {
            return filelist(this.currentThemePath('partial-templates', dir)).map(file => file).length
          }).reduce((a, b) => a + b),
        suffix: 'Parital Templates',
        tab: 3
      })

      this.status.push({
        label: 'Components',
        value: this.theme.components.length,
        suffix: 'Installed',
        tab: 2
      })

      this.status.push({
        label: 'Plugins',
        value: Object.keys(this.theme.plugins).length,
        suffix: 'Dependencies',
        tab: 2
      })

      this.status.push({
        label: 'Assets',
        value: Object.keys(this.theme.asset.libs).length,
        suffix: 'CSS / JS Libraries',
        tab: 2
      })

      this.status.push({
        label: '',
        value: this.sassCount,
        suffix: 'SASS',
        tab: 3
      })

      this.status.push({
        label: '',
        value: Object.keys(this.theme.asset.fonts).length,
        suffix: 'Web Fonts',
        tab: 3
      })

      this.status.push({
        label: 'Customizer',
        value: Object.keys(this.theme.customizer.settings).length,
        suffix: 'Settings',
        tab: 2
      })

      this.status.push({
        label: '',
        value: Object.keys(this.theme.customizer.panels).length,
        suffix: 'Panels',
        tab: 3
      })

      this.status.push({
        label: '',
        value: Object.keys(this.theme.customizer.sections).length,
        suffix: 'Sections',
        tab: 3
      })

      const features = []
      for (const type in featureTypes) {
        if (Object.prototype.hasOwnProperty.call(featureTypes, type) && this.theme.features[featureTypes[type]] !== undefined) {
          features.push({
            value: featureLabels[type]
          })
        }
      }

      this.status = this.status.concat(features.map((item, index) => {
        item.label = (index === 0) ? 'Features' : ''
        item.tab = (index === 0) ? 2 : 3
        return item
      }))

      this.status = this.status.map(item => {
        item.slug = slugify(item.label)
        return item
      })
    }).then(() => {
      const status = this.status.map(item => {
        const suffix = item.suffix ? ` ${item.suffix}` : ''
        return `   ${item.label}${'\t'.repeat(item.tab)} {${item.value}${suffix}}`
      })

      if (this.$init.apiMode()) {
        finish(this.status, true)
      }

      colorlog(status.join('\n'), false)
      colorlog(`type ${chalk.bold.cyan('deux switch')} to change with another project.`)
    }).catch(this.$logger.exit)
  }
}

module.exports = StatusCLI
