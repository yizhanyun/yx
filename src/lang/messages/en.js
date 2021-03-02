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
}
