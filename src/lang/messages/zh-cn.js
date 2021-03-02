module.exports = {
  startMessage: port => `服务器已成功启动。端口${port}`,
  engineNotSupported: '不支持的引擎',
  serverReady: '服务器已启动',
  serverShuttingDown: '正在关闭服务器',
  serverDownFor: '服务器关闭原因：',
  runningGlobalEnhancer: '运行全局服务器增强程序',
  runningSiteEnhancer: site => `运行站点${site}服务器增强程序`,
  useCustomNodemonJson: '使用自定义nodemon配置',
  useDefaultNodemonJson: '使用duosite默认nodemon配置',
  nodemonStarted: 'Nodemon: duosite已启动',
  nodemonQuit: 'Nodemon: duosite已退出',
  nodemonRestart: 'Nodemon: duosite因为如下修改重启:',
}
