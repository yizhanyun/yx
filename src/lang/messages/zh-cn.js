module.exports = {
  startMessage: port => `服务器已成功启动。端口${port}`,
  engineNotSupported: '不支持的引擎',
  serverReady: '服务器已启动',
  serverShuttingDown: '正在关闭服务器',
  serverDownFor: '服务器关闭原因：',
  runningGlobalEnhancer: '运行全局服务器增强程序',
  runningSiteEnhancer: site => `运行站点${site}服务器增强程序`,
}
