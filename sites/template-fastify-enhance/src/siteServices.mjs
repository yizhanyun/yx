const buildSiteServices = async (_yx, settings, site, root) => {
  const {
    security: { salt },
  } = settings

  const addSalt = input => `${input}-${salt}`

  return { addSalt }
}

export default buildSiteServices
