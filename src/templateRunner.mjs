/** Boot a template with params through getStaticProps or getServerProps
 *
 */

const bootTemplateProps = async (file, params, _duosite, request, reply) => {
  return {
    serverProps: {},
    staticProps: {},
  }
}

const bootTemplateStaticPaths = async (file, _duosite, request, reply) => {}

const serveTemplate = async (
  file,
  params,
  _duosite,
  bootedTemplateProps,
  request,
  reply
) => {}

const buildToFile = async (
  url,
  file,
  params,
  _duosite,
  booted,
  request,
  reply
) => {}

export { bootTemplate, bootTemplateStaticPaths, serveTemplate, buildToFile }
