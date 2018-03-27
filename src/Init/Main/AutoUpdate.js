import { ipcMain } from 'electron'
import * as AutoUpdate from '../../Actions/AutoUpdate'

import AutoUpdateService from '../../Services/AutoUpdateService'

let autoUpdateService = null

export function getAutoUpdateService() {
  return autoUpdateService
}

export function initAutoUpdates(settings, mainWindow) {
  if (!autoUpdateService) {
    const options = getAutoUpdateServiceOptions(settings)
    autoUpdateService = new AutoUpdateService(options)
  }
  autoUpdateService.on('checking-for-update',(updateInfo) => {
    console.log(`Checking for updates...`)
  })
  autoUpdateService.on('no-update-available',(updateInfo) => {
    console.log(`v${updateInfo.version} is latest version, no update available!`)
  })
  autoUpdateService.on('update-available',(updateInfo) => {
    console.log(`update v${updateInfo.version} available!`)
    mainWindow.webContents.send(AutoUpdate.UPDATE_AVAILABLE, updateInfo)
  })
  autoUpdateService.on('download-progress',(progressInfo) => {
    mainWindow.webContents.send(AutoUpdate.DOWNLOAD_PROGRESS, progressInfo)
  })
  autoUpdateService.on('update-downloaded',(updateInfo) => {
    mainWindow.webContents.send(AutoUpdate.UPDATE_DOWNLOADED, updateInfo)
  })
  autoUpdateService.on('download-error',(errorInfo) => {
    mainWindow.webContents.send(AutoUpdate.DOWNLOAD_ERROR, errorInfo)
  })
  autoUpdateService.on('error',(errorInfo) => {
    console.log('error in autoupdateservice!')
  })
  ipcMain.on(AutoUpdate.CANCEL_UPDATE, (event) => {
    autoUpdateService.cancelUpdate()
  })
  ipcMain.on(AutoUpdate.BEGIN_DOWNLOADING, (event) => {
    autoUpdateService.downloadUpdate()
  })
  ipcMain.on(AutoUpdate.INSTALL_AND_RELAUNCH, (event) => {
    autoUpdateService.installAndRelaunch()
  })

  autoUpdateService.checkForUpdates()
}

function getAutoUpdateServiceOptions(settings) {
  let allowPrerelease = !!(settings.updates && settings.updates.allowPrerelease)

  console.log(`Prerelease allowed? ${allowPrerelease}`)

  return {
    autoDownload: false,
    allowPrerelease
  }
}
