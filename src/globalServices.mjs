// build global services
// this is a sample services with an `id` function

const buildGlobalServices = async (settings, root) => {
  return {
    id: function (id) {
      return id
    },
  }
}

 export default buildGlobalServices
