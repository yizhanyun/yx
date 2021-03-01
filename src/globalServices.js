// build global services
// this is a sample services with an `id` function

const buildGlobalServices = (settings, root) => {
  return {
    id: function (id) {
      return id
    },
  }
}

module.exports = buildGlobalServices
