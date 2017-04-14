import chalk from 'chalk'

export const INIT = 'Initializing'
export const INIT_PROJECT = 'Init Deux Project'
export const SUCCEED_INITIALIZED = 'Deux project has been initalized'
export const CREATE_NEW_THEME = `Please create new theme, type: ${chalk.bgCyan(' deux new ')}`
export const PROMPT_YES = 'Okay'
export const PROMPT_NO = 'Nope'
export const DONE_FINISH = 'Finish'
export const DONE_UPDATED = 'Updated'
export const ERROR_INVALID_COMMAND = 'Invalid Command'
export const ERROR_NOT_WP_FOLDER = 'You are not in WordPress installation directory.'
export const ERROR_NO_THEME = 'You has 0 themes in project.'
export const ERROR_THEME_NAME_BLANK = 'Theme Name cannot be empty'
export const ERROR_PROJECT_FILE_NOT_EXISTS = '.deuxproject File not exists'
export const ERROR_PROJECT_FILE_INVALID_JSON = 'Invalid format'
export const ERROR_REPOSITORY_URL_NOT_ZIP = 'Repository URL does not contains .zip extension.'
export const ERROR_CANCELED = 'Canceled'
export const ERROR_THEME_ALREADY_EXISTS = `Theme already exists. type: ${chalk.bgCyan('deux reset')} or ${chalk.bgCyan('deux remove theme')} to modify / remove existing theme.`
