// const getServerProps = async ctx => {
//   const { params, _duosite } = ctx

//   return {
//     text: `Server Hello from  index.liquid.boot.js. ID: ${params.id}`,
//   }
// }

const getStaticProps = async ctx => {
  const { params, _duosite } = ctx
  return {
    text: `Static Hello from  index.liquid.boot.js. ID: ${
      params['*'] || params.ids
    }`,
  }
}

const getStaticPaths = async ctx => {
  return {
    paths: [
      { params: { a1: 'mm', b1: 'bbb', ['*']: '1' } }, // See the "paths" section below
      { params: { a1: 'mn', b1: 'bcc', ['*']: '2' } }, // See the "paths" section below
      { params: { a1: 'mo', b1: 'bdd', ['*']: '3' } }, // See the "paths" section below
    ],
    fallback: true,
  }
}

export { getStaticProps, getStaticPaths }
