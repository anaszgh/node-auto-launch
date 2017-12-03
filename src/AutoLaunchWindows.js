/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const fs = require('fs');
const path = require('path');
const Winreg = require('winreg');

const registryKey = new Winreg({
  hive: Winreg.HKCU,
  key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run',
});


module.exports = {
  /**
   * @param {String} appName
   * @returns {Object} - a promise
   */
  disable(appName) {
    return new Promise(((resolve, reject) => registryKey.remove(
      appName,
      (err) => {
        if (err) {
          // The registry key should exist but in case it fails because it doesn't exist,
          // resolve false instead rejecting with an error
          if (err.message.indexOf('The system was unable to find the specified registry key or value') !== -1) {
            return resolve(false);
          }
          return reject(err);
        }
        return resolve();
      },
    )));
  },


  /**
   * @param {Object} options
   * @property {String} options.appName
   * @property {String} options.appPath
   * @property {Boolean} options.isHiddenOnlaunch
   * @returns {Object} - a promise
   */
  enable({ appName, appPath, isHiddenOnLaunch }) {
    return new Promise(((resolve, reject) => {
      let pathToAutoLaunchedApp = appPath;
      let args = '';
      const updateDotExe = path.join(path.dirname(process.execPath), '..', 'update.exe');

      // TODO: use meta

      // If they're using Electron and Squirrel.Windows, point to its Update.exe instead
      // Otherwise, we'll auto-launch an old version after the app has updated
      if (((process.versions != null ? process.versions.electron : undefined) != null) && fs.existsSync(updateDotExe)) {
        pathToAutoLaunchedApp = updateDotExe;
        args = ` --processStart \"${path.basename(process.execPath)}\"`;
        if (isHiddenOnLaunch) { args += ' --process-start-args "--hidden"'; }
      } else if (isHiddenOnLaunch) { args += ' --hidden'; }

      return registryKey.set(appName, Winreg.REG_SZ, `\"${pathToAutoLaunchedApp}\"${args}`, (err) => {
        if (err != null) { return reject(err); }
        return resolve();
      });
    }));
  },


  /**
   * @param {String} appName
   * @returns {Object} - a promise which resolves to a {Boolean}
   */
  isEnabled(appName) {
    return new Promise((resolve => registryKey.get(
      appName,
      (err, item) => {
        if (err) {
          return resolve(false);
        }
        return resolve(item);
      },
    )));
  },
};
