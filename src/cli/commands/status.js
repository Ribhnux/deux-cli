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
      templates,
      components,
      plugins,
      assets,
      scss
    } = result

    const themePath = path.join(wpThemeDir, textDomain)
    const themeStyle = path.join(themePath, 'style.css')
    wpFileHeader(themeStyle).then(info => {
      const {
        themeUri,
        author,
        authorUri
      } = info

      colorlog(`Your current project is {${themeName}}`, false)
      stats.push(`Theme URI\t\t: {${themeUri}}`)
      stats.push(`Author\t\t\t: {${author}}`)
      stats.push(`Author URI\t\t: {${authorUri}}`)
      stats.push(`Version\t\t\t: {${version}}`)
      stats.push(`Path\t\t\t: {${themePath}}`)
      stats.push(`Repository URL\t\t: {${repoUrl}}`)
      stats.push(`Page Templates\t\t: {${templates.page.length}} Templates`)
      stats.push(`Partial Templates\t: {${templates.partial.length}} Templates`)
      stats.push(`Components\t\t: {${components.length}} Installed`)
      stats.push(`Plugins\t\t\t: {${Object.keys(plugins).length}} Dependencies`)
      stats.push(`Javascript\t\t: {${Object.keys(assets.js).length}} Dependencies`)
      stats.push(`CSS\t\t\t: {${Object.keys(assets.css).length}} Dependencies`)
      stats.push(`SASS\t\t\t: {${Object.keys(scss).length}} Files`)
      colorlog(stats.join('\n'))
      colorlog(`type ${chalk.bold.cyan('deux switch')} to change with another project.\ntype ${chalk.bold.cyan('deux list')} to view list of project.`, false)
    })
  })
}
