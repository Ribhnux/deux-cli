import path from 'path'
import chalk from 'chalk'
import wpFileHeader from 'wp-get-file-header'
import {colorlog} from '../../lib/logger'
import {wpThemeDir} from '../../lib/const'
import {getCurrentTheme} from '../../lib/db-utils'

export default db => {
  getCurrentTheme(db).then(result => {
    const stats = []
    const {
      version,
      themeName,
      textDomain,
      repoUrl,
      asset,
      template,
      components,
      plugins
    } = result

    const themePath = path.join(wpThemeDir, textDomain)
    const themeStyle = path.join(themePath, 'style.css')
    wpFileHeader(themeStyle).then(info => {
      const {
        themeUri,
        author,
        authorUri
      } = info

      let scssCount = 0
      for (const i in asset.scss) {
        if (Object.prototype.hasOwnProperty.call(asset.scss, i)) {
          scssCount += asset.scss[i].length
        }
      }

      console.log('')
      colorlog(`Your current project is {${themeName}}`, false)
      stats.push(`Theme URI\t\t: {${themeUri}}`)
      stats.push(`Author\t\t\t: {${author}}`)
      stats.push(`Author URI\t\t: {${authorUri}}`)
      stats.push(`Version\t\t\t: {${version}}`)
      stats.push(`Path\t\t\t: {${themePath}}`)
      stats.push(`Repository URL\t\t: {${repoUrl}}`)
      stats.push(`Page Templates\t\t: {${template.pages.length}} Templates`)
      stats.push(`Partial Templates\t: {${template.partials.length}} Templates`)
      stats.push(`Components\t\t: {${components.length}} Installed`)
      stats.push(`Plugins\t\t\t: {${Object.keys(plugins).length}} Dependencies`)
      stats.push(`CSS / JS Libraries\t: {${Object.keys(asset.libs).length}} Dependencies`)
      stats.push(`SASS\t\t\t: {${scssCount}} Files`)
      stats.push(`Web Fonts\t\t: {${Object.keys(asset.fonts).length}} Fonts`)
      colorlog(stats.join('\n'))
      colorlog(`type ${chalk.bold.cyan('deux switch')} to change with another project.`, false)
    })
  })
}
