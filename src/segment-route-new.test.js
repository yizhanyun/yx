const path = require('path')

const {
  recursiveReadDirSync,
  removeSuffix,
  segmentsToRoute,
  segmentsToRouteNew,
  parseRouteSegment,
  buildFileRoutingTable,
  buildFileRoutingTableNew,
} = require('./utils')

test('Parse route segments new 1', () => {
  const routeTable = segmentsToRouteNew(['abc', 'def', '[mm].ejs'])
  console.log(routeTable)
  expect(routeTable[0]).toBe('catch')
})

test('Parse route segments new 2', () => {
  const routeTable = segmentsToRouteNew(['abc', 'def', '[...mm].ejs'])
  console.log(routeTable)
  expect(routeTable[0]).toBe('catchAll')
})

test('Parse route segments new 3', () => {
  const routeTable = segmentsToRouteNew(['abc', 'def', '[[...mm]].ejs'])
  console.log(routeTable)
  expect(routeTable[0]).toBe('optionalCatchAll')
})

test('Parse route segments new 4', () => {
  const routeTable = segmentsToRouteNew(['abc', 'def', '[[mm]].ejs'])
  console.log(routeTable)
  expect(routeTable[0]).toBe('error')
})

test('Parse route segments new 5', () => {
  const routeTable = segmentsToRouteNew(['$$abc', 'def', '[[...mm]].ejs'])
  console.log(routeTable)
  expect(routeTable[0]).toBe('error')
})

test('Parse route segments new 6', () => {
  const routeTable = segmentsToRouteNew(['abc', '[def]', 'gg', '[[...mm]].ejs'])
  console.log(routeTable)
  expect(routeTable[0]).toBe('error')
})

test('Parse route segments new 7', () => {
  const routeTable = segmentsToRouteNew([
    'abc',
    '[def]',
    '[gg]',
    '[[...mm]].ejs',
  ])
  console.log(routeTable)
  expect(routeTable[0]).toBe('optionalCatchAll')
})

test('Parse route segments new 8', () => {
  const routeTable = segmentsToRouteNew(['abc', '[def]', '[gg]', '[...mm].ejs'])
  console.log(routeTable)
  expect(routeTable[0]).toBe('catchAll')
})

test('Parse route segments new 9', () => {
  const routeTable = segmentsToRouteNew(['abc', '[def]', '[gg]', '[mm].ejs'])
  console.log(routeTable)
  expect(routeTable[0]).toBe('catch')
})

test('Parse route segments new 10', () => {
  const routeTable = segmentsToRouteNew(['[abc]', '[def]', '[gg]', '[mm].ejs'])
  console.log(routeTable)
  expect(routeTable[0]).toBe('catch')
})

test('Parse route segments new 11', () => {
  const routeTable = segmentsToRouteNew(['abc', 'def', 'gg', 'mm.ejs'])
  console.log(routeTable)
  expect(routeTable[0]).toBe('static')
})

test('Parse route segments new 12', () => {
  const routeTable = segmentsToRouteNew(['mm.ejs'])
  console.log(routeTable)
  expect(routeTable[0]).toBe('static')
})

test('Parse route segments new 13', () => {
  const routeTable = segmentsToRouteNew([
    'a',
    'b',
    '[c]',
    '[d]',
    '[e]',
    '[f].liquid',
  ])
  console.log(routeTable)
  expect(routeTable[0]).toBe('catch')
})

test('Build file routing table case 1', () => {
  const routingTable = buildFileRoutingTableNew(
    '/home/fqye/projects/duosite-mono/duosite/sites/test-1/pages',
    '.liquid'
  )

  console.log('routingTable >>>>', JSON.stringify(routingTable, null, 2))
  expect(true).toBeTruthy()
})
