import jsonr from 'json-realtime'
import chalk from 'chalk'
import {colorlog} from '../../lib/logger'
import {projectPath} from '../../lib/const'

export default () => {
  const deuxProject = jsonr(projectPath)
  if (deuxProject.current !== '') {
    const {themeName, version, git} = deuxProject.list[deuxProject.current]
    colorlog(`Your current project is {${themeName}}\ntype ${chalk.bgCyan(' deux switch ')} to switching with another project.`)

    let stats = ''
    stats += `Version: {${version}}\n`
    stats += `Repository URL: {${git}}`
    colorlog(stats, false)
  }
}
