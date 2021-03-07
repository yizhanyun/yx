const getServerProps = async ctx => {
  return {
    text: 'Server Hello from index.liquid.boot.js ',
  }
}

const getStaticProps = async ctx => {
  return {
    text: 'Static Hello from  index.liquid.boot.js ',
  }
}

export { getServerProps, getStaticProps }
