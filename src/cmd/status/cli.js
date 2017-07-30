const chalk = require('chalk')
const execa = require('execa')

const CLI = global.deuxcli.require('main')
const {colorlog, exit} = global.deuxhelpers.require('logger')

class StatusCLI extends CLI {
  constructor() {
    super()
    this.statusList = []
    this.sassCount = 0
    this.init()
  }

  prepare() {
    const themeInfo = this.themeInfo()

    for (const i in themeInfo.asset.sass) {
      if (Object.prototype.hasOwnProperty.call(themeInfo.asset.sass, i)) {
        this.sassCount += themeInfo.asset.sass[i].length
      }
    }

    this.title = `Your current project is {${this.themeDetails('name')}}`
  }

  action() {
    Promise.all([
      new Promise(resolve => {
        const themeDetails = this.themeDetails()
        const themeInfo = this.themeInfo()

        execa('git', [`--git-dir=${this.themePath([themeDetails.slug, '.git'])}`, 'remote', 'get-url', 'origin'])
        .then(output => {
          const gitUrl = output.stdout

          this.statusList.push(`Theme URI\t\t: {${themeDetails.uri}}`)
          this.statusList.push(`Author\t\t\t: {${themeDetails.author}}`)
          this.statusList.push(`Author URI\t\t: {${themeDetails.authorUri}}`)
          this.statusList.push(`Version\t\t\t: {${themeDetails.version}}`)
          this.statusList.push(`Path\t\t\t: {${this.themePath(themeDetails.slug)}}`)

          if (gitUrl) {
            this.statusList.push(`Repository URL\t\t: {${gitUrl}}`)
          }

          this.statusList.push(`Page Templates\t\t: {${themeInfo.pageTemplates.length}} Templates`)
          this.statusList.push(`Partial Templates\t: {${themeInfo.partialTemplates.length}} Templates`)
          this.statusList.push(`Components\t\t: {${themeInfo.components.length}} Installed`)
          this.statusList.push(`Plugins\t\t\t: {${Object.keys(themeInfo.plugins).length}} Dependencies`)
          this.statusList.push(`CSS / JS Libraries\t: {${Object.keys(themeInfo.asset.libs).length}} Dependencies`)
          this.statusList.push(`SASS\t\t\t: {${this.sassCount}} Files`)
          this.statusList.push(`Web Fonts\t\t: {${Object.keys(themeInfo.asset.fonts).length}} Fonts`)

          colorlog(this.statusList.join('\n'), false)
          resolve()
        }).catch(exit)
      }),
    ]).then(() => {
      colorlog(`type ${chalk.bold.cyan('deux switch')} to change with another project.`)
    }).catch(exit)
  }
}

module.exports = StatusCLI
