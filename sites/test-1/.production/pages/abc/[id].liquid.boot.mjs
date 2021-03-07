// const getServerProps = async ctx => {
//   const { params, _duosite } = ctx

//   return {
//     text: `Server Hello from  index.liquid.boot.js. ID: ${params.id}`,
//   }
// }

const getStaticProps = async ctx => {
  const { params, _duosite } = ctx
  return {
    text: `Static Hello from  index.liquid.boot.js. ID: ${params.id}`,
  }
}

const getStaticPaths = async ctx => {
  return {
    paths: [
      { params: { id: '1' } }, // See the "paths" section below
      { params: { id: '2' } }, // See the "paths" section below
      { params: { id: '3' } }, // See the "paths" section below
    ],
    fallback: true,
  }
}

export { getStaticProps, getStaticPaths }
