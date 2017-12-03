const untildify = require('untildify');
const fileBasedUtilities = require('./fileBasedUtilities');

/**
 * @returns {String}
 */
const getDirectory = function getDirectory() {
  return untildify('~/.config/autostart/');
};

/**
 * @param {String} appName
 * @returns {String}
 */
const getFilePath = function getFilePath(appName) {
  return `${getDirectory()}${appName}.desktop`;
};


module.exports = {
  /**
   * @param {String} appName
   * @returns {Object} - a promise
   */
  disable(appName) {
    return fileBasedUtilities.removeFile(getFilePath(appName));
  },


  /**
   * @param {Object} opts
   * @property {String} opts.appName
   * @property {String} opts.appPath
   * @property {Boolean} opts.isHiddenOnLaunch
   * @returns {Object} - a promise
   */
  enable({ appName, appPath, isHiddenOnLaunch }) {
    const hiddenArg = isHiddenOnLaunch ? ' --hidden' : '';

    // TODO: is indentation OK?
    const data = `[Desktop Entry]
                  Type=Application
                  Version=1.0
                  Name=${appName}
                  Comment=${appName}startup script
                  Exec=${appPath}${hiddenArg}
                  StartupNotify=false
                  Terminal=false`;

    return fileBasedUtilities.createFile({
      data,
      directory: getDirectory(),
      filePath: getFilePath(appName),
    });
  },


  /**
   * @param {String} appName
   * @returns {Object} - a promise which resolves to a Boolean
   */
  isEnabled(appName) {
    return fileBasedUtilities.isEnabled(getFilePath(appName));
  },
};
