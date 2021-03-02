module.exports = {
  startMessage: port => `Server started at port ${port}`,
  engineNotSupported: 'Unsupported view engine',
  serverReady: 'Server ready',
  serverShuttingDown: 'Server is shutting down',
  serverDownFor: 'Server is hutting dow for：',
  runningGlobalEnhancer: 'Running global enhancer',
  runningSiteEnhancer: site => `Running ${site} subsite enhancer`,
  useCustomNodemonJson: 'Use custom nodemon configuration',
  useDefaultNodemonJson: 'Use defaultnodemon configuration',
  nodemonStarted: 'Nodemon: duosite started',
  nodemonQuit: 'Nodemon: duosite quit',
  nodemonRestart: 'Nodemon: duosite restarted duo to:',
  duositeUsage:
    '\n!Error:Wrong argument. \nUsage:\n  duosite dev - run devevelopment\n  duosite prod = run production\n  duosite new - create new site from template',
  duositeNewUsage:
    '\n!Error: Wrong arguments. \nUsage: \n  duosite new <template-name> <new-site-name>',
  duositeWrongTemplateName: '\n!!Error: Wrong template name',
  duositeTemplateNotFound: '\n!!Error: Template not found',
  duositeSubdomainError: '\n!!Error: Not a legal subdomain name',
  duositeNewSiteExists: '\n!!Error: New site already exists',
  createNewSiteDone: site => `Create new site ${toSite} done`,
  productionNotReady: '!Warning: Production build is not released yet',
}
