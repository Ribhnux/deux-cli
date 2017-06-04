const path = require('path')
const chalk = require('chalk')

const colorlog = global.helpers.require('logger/colorlog')
const noop = global.helpers.require('logger/noop')
const {wpThemeDir} = global.helpers.require('constant/path')
const {getCurrentTheme} = global.helpers.require('db/utils')

module.exports = db => {
  getCurrentTheme(db).then(theme => {
    const stats = []
    const themePath = path.join(wpThemeDir, theme.details.slug)
    let scssCount = 0

    for (const i in theme.asset.scss) {
      if (Object.prototype.hasOwnProperty.call(theme.asset.scss, i)) {
        scssCount += theme.asset.scss[i].length
      }
    }

    noop()
    colorlog(`Your current project is {${theme.details.name}}`, false)
    stats.push(`Theme URI\t\t: {${theme.details.uri}}`)
    stats.push(`Author\t\t\t: {${theme.details.author}}`)
    stats.push(`Author URI\t\t: {${theme.details.authorUri}}`)
    stats.push(`Version\t\t\t: {${theme.details.version}}`)
    stats.push(`Path\t\t\t: {${themePath}}`)
    stats.push(`Repository URL\t\t: {${theme.details.repoUrl}}`)
    stats.push(`Page Templates\t\t: {${theme.template.pages.length}} Templates`)
    stats.push(`Partial Templates\t: {${theme.template.partials.length}} Templates`)
    stats.push(`Components\t\t: {${theme.components.length}} Installed`)
    stats.push(`Plugins\t\t\t: {${Object.keys(theme.plugins).length}} Dependencies`)
    stats.push(`CSS / JS Libraries\t: {${Object.keys(theme.asset.libs).length}} Dependencies`)
    stats.push(`SASS\t\t\t: {${scssCount}} Files`)
    stats.push(`Web Fonts\t\t: {${Object.keys(theme.asset.fonts).length}} Fonts`)
    colorlog(stats.join('\n'))
    colorlog(`type ${chalk.bold.cyan('deux switch')} to change with another project.`, false)
    noop()
  })
}
