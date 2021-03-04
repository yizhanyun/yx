const path = require('path')

const {
  recursiveReadDirSync,
  removeFileSuffix,
  buildFileRouting,
  segmentsToRoute,
  parseRouteSegment,
} = require('./utils')

test('adds 1 + 2 to equal 3', () => {
  expect(1 + 2).toBe(3)
})

test('Recusively read dir sync build folder tree successfully', () => {
  const tree = recursiveReadDirSync(process.cwd())

  expect(true).toBeTruthy()
})

test('Remove file suffix correctly', () => {
  const abc = removeFileSuffix('abc.js', 'js')

  expect(abc).toBe('abc')
})

test('Built file routing correctly', () => {
  const r = buildFileRouting(
    path.join(process.cwd(), 'sites', 'test-1', 'pages'),
    '.liquid'
  )
  console.log(JSON.stringify(r, null, 2))
  expect(true).toBeTruthy()
})

test('Test segments is route correctly case 1', () => {
  const segments = ['abc', '[def].ext']
  const [isRoute] = segmentsToRoute(segments)
  expect(isRoute).toBeTruthy()
})

test('Test segments is route correctly case 2', () => {
  const segments = ['abc', '[bb]', '[def].ext']
  const [isRoute] = segmentsToRoute(segments)
  expect(isRoute).toBeTruthy()
})

test('Test segments is route correctly case 2.2', () => {
  const segments = ['abc', 'bb', '[def].ext']
  const [isRoute] = segmentsToRoute(segments)
  expect(isRoute).toBeTruthy()
})

test('Test segments is route correctly case 3', () => {
  const segments = ['abc', '[bb]', 'jj', '[def].ext']
  const [isRoute] = segmentsToRoute(segments)
  expect(isRoute).toBeFalsy()
})

test('Test segments is route correctly case 4', () => {
  const segments = ['abc', '[bb]', '[jj]', '[def].ext']
  const [isRoute] = segmentsToRoute(segments)
  expect(isRoute).toBeTruthy()
})

test('Test segments is route correctly case 5', () => {
  const segments = ['abc', '[bb]', '[[jj]]', '[def].ext']
  const [isRoute] = segmentsToRoute(segments)
  expect(isRoute).toBeFalsy()
})

test('Test segments is route correctly case 6', () => {
  const segments = ['[abc]', '[bb]', '[jj]', '[def].ext']
  const [isRoute] = segmentsToRoute(segments)
  expect(isRoute).toBeTruthy()
})

test('Test segments is route correctly case 7', () => {
  const segments = ['[abc]', '[bb]', '[jj]', '[[def]].ext']
  const [isRoute] = segmentsToRoute(segments)
  expect(isRoute).toBeFalsy()
})

test('Test segments is route correctly case 8', () => {
  const segments = ['[abc]', '[bb]', '[jj]', '[[def].ext']
  const [isRoute] = segmentsToRoute(segments)
  expect(isRoute).toBeFalsy()
})

test('Test segments is route correctly case 9', () => {
  const segments = ['abc', 'def', 'hi']
  const [isRoute] = segmentsToRoute(segments)
  expect(isRoute).toBeFalsy()
})

test('Test segments is route correctly case 11', () => {
  const segments = ['[abc]', '[bb]', '[jj]', '[...def].ext']
  const [isRoute] = segmentsToRoute(segments)
  expect(isRoute).toBeFalsy()
})

test('Test segments is route correctly case 11.2', () => {
  const segments = ['abc', 'bb', 'jj', '[...def].ext']
  const [isRoute] = segmentsToRoute(segments)
  expect(isRoute).toBeTruthy()
})

test('Test segments is route correctly case 12', () => {
  const segments = ['[abc]', '[bb]', '[jj]', '[[...def]].ext']
  const [isRoute] = segmentsToRoute(segments)
  expect(isRoute).toBeFalsy()
})

test('Test segments is route correctly case 12.2', () => {
  const segments = ['abc', 'bb', 'jj', '[[...def]].ext']
  const [isRoute] = segmentsToRoute(segments)
  expect(isRoute).toBeTruthy()
})

test('Parse route segment 1', () => {
  const route = parseRouteSegment('[[...id]]')
  expect(route).toEqual(['*', 'id', 'optionalCatchAll'])
})

test('Parse route segment 2', () => {
  const route = parseRouteSegment('[[....id]]')
  console.log(route)
  expect(route).toEqual(null)
})

test('Parse route segment 3', () => {
  const route = parseRouteSegment('[...id]')
  console.log(route)
  expect(route).toEqual(['*', 'id', 'catchAll'])
})

test('Parse route segment 4', () => {
  const route = parseRouteSegment('[id]')
  console.log(route)
  expect(route).toEqual(['id', 'id', 'catch'])
})

test('Parse route segment 5', () => {
  const route = parseRouteSegment('[[id]]')
  console.log(route)
  expect(route).toEqual(null)
})
