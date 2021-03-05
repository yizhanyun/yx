export default {
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
  duositeUsage:
    '\n!!错误: 错误的参数. \n用法:\n  duosite ls - 模板列表\n  duosite dev - 运行开发环境\n  duosite prod - 运行生产环境\n  duosite new - 使用模板创建新站点',
  duositeNewUsage:
    '\n!!错误: 错误的参数. \n用法:\n  duosite new <template-name> <new-site-name>',
  duositeWrongTemplateName: '\n!!错误: 错误的模板名',
  duositeTemplateNotFound: '\n!!错误: 模板未找到',
  duositeSubdomainError: '\n!!错误:  新站点名称不是合法的子域名',
  duositeNewSiteExists: '\n!!错误:  新站点已存在',
  createNewSiteDone: site => `成功创建 ${site} `,
  productionNotReady: '!警告: 生产版本尚未发布',
}
