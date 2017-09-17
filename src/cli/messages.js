const chalk = require('chalk')
const sample = require('lodash.sample')

const removehint = (cmd, prefix = 'Please choose another name') => {
  return `${prefix}, type: ${chalk.bold.cyan(`deux remove ${cmd}`)} to remove from list`
}

const coolRandomizer = () => {
  const messages = [
    'Cool',
    'Awesome',
    'Great'
  ]
  return sample(messages)
}

const okayRandomizer = () => {
  const messages = [
    'It\'s okay',
    'It\'s alright',
    'Keep calm',
    'Don\'t worry'
  ]
  return sample(messages)
}

exports.INIT = 'Initializing'
exports.INIT_PROJECT = 'Init Deux Project'
exports.SUCCEED_INITIALIZED = 'Deux project has been initialized'
exports.CREATE_NEW_THEME = `Please create new theme, type: ${chalk.bold.cyan('deux new')}`
exports.PROMPT_YES = 'Okay'
exports.PROMPT_NO = 'Nope'
exports.DONE_FINISH = 'Finish'
exports.DONE_UPDATED = 'Updated'
exports.MORE_INFO = `type ${chalk.bold.cyan('deux --help')} to see available commands.`
exports.SYNC_NEXT_TIME = 'It\'s okay, you can do it next time.'
exports.DONE_NO_REMOVE = 'Remove nothing.'
exports.SUCCEED_INIT_DB = 'Success init database.'
exports.SUCCEED_CREATE_NEW_THEME = 'Your new theme has been created.'
exports.SUCCEED_ALREADY_IN_CURRENT_PROJECT = 'Theme already used as current project.'
exports.SUCCEED_THEME_SWITCHED = `Switched with another theme, type: ${chalk.bold.cyan('deux status')} to view project details.`
exports.SUCCEED_COMPONENT_ADDED = `${coolRandomizer()}, new component has been added to 'components' directory.`
exports.SUCCEED_PAGE_TEMPLATE_ADDED = `${coolRandomizer()}, new page template has been added to 'page-templates' directory.`
exports.SUCCEED_PARTIAL_TEMPLATE_ADDED = `${coolRandomizer()}, new partial template has been added to 'partial-templates' directory.`
exports.SUCCEED_WOOCOMMERCE_TEMPLATE_ADDED = `${coolRandomizer()}, new woocommerce template has been added to 'woocommerce' directory.`
exports.SUCCEED_PLUGIN_ADDED = `${coolRandomizer()}, new plugin has been added in dependencies list.`
exports.SUCCEED_ASSET_ADDED = `${coolRandomizer()}, new assets has been added in dependencies list.`
exports.SUCCEED_WIDGET_ADDED = `${coolRandomizer()}, new widget has been added.`
exports.SUCCEED_HELPER_ADDED = `${coolRandomizer()}, new helper has been added to 'includes/helpers' directory.`
exports.SUCCEED_LIBCLASS_ADDED = `${coolRandomizer()}, new class has been added to 'includes/libraries' directory.`
exports.SUCCEED_MENU_ADDED = `${coolRandomizer()}, new menu has been added.`
exports.SUCCEED_FEATURE_ADDED = `${coolRandomizer()}, new feature has been added.`
exports.SUCCEED_IMGSIZE_ADDED = `${coolRandomizer()}, new image size has been added.`
exports.SUCCEED_HOOKS_ADDED = `${coolRandomizer()}, new hooks has been added.`
exports.SUCCEED_CUSTOMIZER_ADDED = `${coolRandomizer()}, new customizer setting has been added.`
exports.SUCCEED_SYNCRHONIZED = 'Synchronizing theme config with database has been completed.'
exports.SUCCEED_REMOVED_THEME = `Theme have been removed from project, type ${chalk.bold.cyan('deux new')} to add new theme`
exports.SUCCEED_REMOVED_ASSET = `${okayRandomizer()}, you've just removed some assets from theme.`
exports.SUCCEED_REMOVED_PLUGIN = `${okayRandomizer()}, you've just removed some plugins from theme.`
exports.SUCCEED_REMOVED_COMPONENT = `${okayRandomizer()}, you've just removed some components from theme.`
exports.SUCCEED_REMOVED_HELPER = `${okayRandomizer()}, you've just removed some helpers from theme.`
exports.SUCCEED_REMOVED_LIBCLASS = `${okayRandomizer()}, you've just removed some php libraries from theme.`
exports.SUCCEED_REMOVED_TEMPLATE = `${okayRandomizer()}, you've just removed some files from theme's template.`
exports.SUCCEED_REMOVED_FEATURE = `${okayRandomizer()}, you've just removed some features from theme.`
exports.SUCCEED_REMOVED_WIDGET = `${okayRandomizer()}, you've just removed some widgets from theme.`
exports.SUCCEED_REMOVED_MENU = `${okayRandomizer()}, you've just removed some menus from theme.`
exports.SUCCEED_REMOVED_IMGSIZE = `${okayRandomizer()}, you've just removed some image size from theme.`
exports.SUCCEED_REMOVED_HOOKS = `${okayRandomizer()}, you've just removed some hooks from theme.`
exports.SUCCEED_REMOVED_CUSTOMIZER = `${okayRandomizer()}, you've just removed some customizers from theme.`
exports.SUCCEED_VALID_THEME = 'Your theme is valid and ready to release'
exports.SUCCEED_UPDATED = 'Your assets or plugins are updated.'
exports.SUCCEED_ALL_UPDATED = 'All of your assets or plugins are up to date.'
exports.ERROR_INVALID_COMMAND = 'Invalid Command.'
exports.ERROR_NOT_WP_FOLDER = 'Invalid WordPress installation directory.'
exports.ERROR_NO_THEME = 'You have 0 themes in project.'
exports.ERROR_NO_THEME_FOUND = 'Theme not found.'
exports.ERROR_INVALID_PROJECT = 'Invalid project, please check .deuxproject in current directory.'
exports.ERROR_THEME_NAME_BLANK = 'Theme Name cannot be empty'
exports.ERROR_PROJECT_FILE_NOT_EXISTS = '.deuxproject File not exists.'
exports.ERROR_PROJECT_FILE_INVALID_JSON = 'Invalid format.'
exports.ERROR_INVALID_URL = 'Invalid URL.'
exports.ERROR_INVALID_VERSION = 'Invalid Version.'
exports.ERROR_REPOSITORY_URL_NOT_ZIP = 'Repository URL does not contains .zip extension.'
exports.ERROR_CANCELED = 'Canceled'
exports.ERROR_THEME_ALREADY_EXISTS = `Theme already exists. type: ${chalk.bold.cyan('deux remove theme')} to remove existing theme.`
exports.ERROR_COMPONENT_ALREADY_EXISTS = `Component already exists. ${removehint('component')}`
exports.ERROR_PLUGIN_ALREADY_EXISTS = `Plugin already exists. ${removehint('component', 'Please add another one')}`
exports.ERROR_TEMPLATE_ALREADY_EXISTS = `Template already exists. ${removehint('template')}`
exports.ERROR_SASS_FILE_ALREADY_EXISTS = `SASS file already exists. ${removehint('sass')}`
exports.ERROR_WIDGET_ALREADY_EXISTS = `Widget already exists. ${removehint('widget')}`
exports.ERROR_HELPER_ALREADY_EXISTS = `Helper already exists. ${removehint('helper')}`
exports.ERROR_LIBCLASS_ALREADY_EXISTS = `Library already exists. ${removehint('libclass')}`
exports.ERROR_MENU_ALREADY_EXISTS = `Menu location already exists. ${removehint('menu')}`
exports.ERROR_FEATURE_ALREADY_EXISTS = `Feature already exists. ${removehint('menu', 'Please add another feature')}`
exports.ERROR_IMGSIZE_ALREADY_EXISTS = `Image Size already exists. ${removehint('imgsize')}`
exports.ERROR_HOOKS_ALREADY_EXISTS = `Hooks already exists. ${removehint('hooks')}`
exports.ERROR_THEME_CREATION_CANCELED = 'Theme creation was canceled.'
exports.ERROR_GIT_INIT = 'There is something wrong when initializing git.'
exports.ERROR_GIT_REMOTE_ADD = 'There is something wrong when add remote url to git.'
exports.ERROR_THEME_NOT_IN_LIST = 'Theme is not part of project list.'
exports.ERROR_QUERY_NOT_FOUND = 'Search query are not matched with any results.'
exports.ERROR_INVALID_API_KEY = 'Invalid Google Fonts API Key.'
exports.ERROR_CONFIG_NOT_EXISTS = 'Config file not exists'
exports.ERROR_INVALID_THEME = `Invalid theme, type: ${chalk.bold.cyan('deux validate theme')} to see the details`
exports.ERROR_INVALID_WPCS = `Invalid coding standard, type: ${chalk.bold.cyan('deux validate standard')} to see the details`
exports.ERROR_INVALID_W3 = `Invalid html5 theme, type: ${chalk.bold.cyan('deux validate markup')} to see the details`
