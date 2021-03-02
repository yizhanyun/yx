const getServerProps = async ctx => {
  return {
    text: 'Hello from boot.js ',
  }
}

module.exports = {
  getServerProps,
}
