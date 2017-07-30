const chalk = require('chalk')

const CLI = global.deuxcli.require('main')
const {colorlog} = global.deuxhelpers.require('logger')

class StatusCLI extends CLI {
  constructor() {
    super()
    this.statusList = []
    this.init()
  }

  prepare() {
    const themeDetails = this.themeDetails()
    const themeInfo = this.themeInfo()

    let sassCount = 0
    for (const i in themeInfo.asset.sass) {
      if (Object.prototype.hasOwnProperty.call(themeInfo.asset.sass, i)) {
        sassCount += themeInfo.asset.sass[i].length
      }
    }

    this.title = `Your current project is {${themeDetails.name}}`

    this.statusList.push(`Theme URI\t\t: {${themeDetails.uri}}`)
    this.statusList.push(`Author\t\t\t: {${themeDetails.author}}`)
    this.statusList.push(`Author URI\t\t: {${themeDetails.authorUri}}`)
    this.statusList.push(`Version\t\t\t: {${themeDetails.version}}`)
    this.statusList.push(`Path\t\t\t: {${this.themePath(themeDetails.slug)}}`)
    this.statusList.push(`Repository URL\t\t: {${themeDetails.repoUrl}}`)
    this.statusList.push(`Page Templates\t\t: {${themeInfo.pageTemplates.length}} Templates`)
    this.statusList.push(`Partial Templates\t: {${themeInfo.partialTemplates.length}} Templates`)
    this.statusList.push(`Components\t\t: {${themeInfo.components.length}} Installed`)
    this.statusList.push(`Plugins\t\t\t: {${Object.keys(themeInfo.plugins).length}} Dependencies`)
    this.statusList.push(`CSS / JS Libraries\t: {${Object.keys(themeInfo.asset.libs).length}} Dependencies`)
    this.statusList.push(`SASS\t\t\t: {${sassCount}} Files`)
    this.statusList.push(`Web Fonts\t\t: {${Object.keys(themeInfo.asset.fonts).length}} Fonts`)
  }

  action() {
    colorlog(this.statusList.join('\n'), false)
    colorlog(`type ${chalk.bold.cyan('deux switch')} to change with another project.`)
  }
}

module.exports = StatusCLI
