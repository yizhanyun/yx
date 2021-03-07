/* eslint-disable */

const path = require('path')

const {
  recursiveReadDirSync,
  removeSuffix,
  segmentsToRoute,

  buildFileRoutingTable,
  buildFileRouteUrlVariableTable,
} = require('./utils')

test('Parse route segments new 1', () => {
  const routeTable = segmentsToRoute(['abc', 'def', '[mm].ejs'])
  console.log(routeTable)
  expect(routeTable[0]).toBe('catch')
})

test('Parse route segments new 2', () => {
  const routeTable = segmentsToRoute(['abc', 'def', '[...mm].ejs'])
  console.log(routeTable)
  expect(routeTable[0]).toBe('catchAll')
})

test('Parse route segments new 3', () => {
  const routeTable = segmentsToRoute(['abc', 'def', '[[...mm]].ejs'])
  console.log(routeTable)
  expect(routeTable[0]).toBe('optionalCatchAll')
})

test('Parse route segments new 4', () => {
  const routeTable = segmentsToRoute(['abc', 'def', '[[mm]].ejs'])
  console.log(routeTable)
  expect(routeTable[0]).toBe('error')
})

test('Parse route segments new 5', () => {
  const routeTable = segmentsToRoute(['$$abc', 'def', '[[...mm]].ejs'])
  console.log(routeTable)
  expect(routeTable[0]).toBe('error')
})

test('Parse route segments new 6', () => {
  const routeTable = segmentsToRoute(['abc', '[def]', 'gg', '[[...mm]].ejs'])
  console.log(routeTable)
  expect(routeTable[0]).toBe('error')
})

test('Parse route segments new 7', () => {
  const routeTable = segmentsToRoute(['abc', '[def]', '[gg]', '[[...mm]].ejs'])
  console.log(routeTable)
  expect(routeTable[0]).toBe('optionalCatchAll')
})

test('Parse route segments new 8', () => {
  const routeTable = segmentsToRoute(['abc', '[def]', '[gg]', '[...mm].ejs'])
  console.log(routeTable)
  expect(routeTable[0]).toBe('catchAll')
})

test('Parse route segments new 9', () => {
  const routeTable = segmentsToRoute(['abc', '[def]', '[gg]', '[mm].ejs'])
  console.log(routeTable)
  expect(routeTable[0]).toBe('catch')
})

test('Parse route segments new 10', () => {
  const routeTable = segmentsToRoute(['[abc]', '[def]', '[gg]', '[mm].ejs'])
  console.log(routeTable)
  expect(routeTable[0]).toBe('catch')
})

test('Parse route segments new 11', () => {
  const routeTable = segmentsToRoute(['abc', 'def', 'gg', 'mm.ejs'])
  console.log(routeTable)
  expect(routeTable[0]).toBe('static')
})

test('Parse route segments new 12', () => {
  const routeTable = segmentsToRoute(['mm.ejs'])
  console.log(routeTable)
  expect(routeTable[0]).toBe('static')
})

test('Parse route segments new 13', () => {
  const routeTable = segmentsToRoute([
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

test('Parse route segments new 14', () => {
  const routeTable = segmentsToRoute(['about', 'index.html'])
  console.log(routeTable)
  expect(routeTable[0]).toBe('catch')
})

test('Build file routing table case 1', () => {
  const routingTable = buildFileRoutingTable(
    '/home/fqye/projects/duosite-mono/duosite/sites/test-1/pages',
    '.liquid'
  )

  expect(true).toBeTruthy()
})

test('Build file route url variables table case 1', () => {
  const routingTable = buildFileRoutingTable(
    '/home/fqye/projects/duosite-mono/duosite/sites/test-1/pages',
    '.liquid'
  )

  console.log('routingTable >>>>', JSON.stringify(routingTable, null, 2))
  const urlVariablesTable = buildFileRouteUrlVariableTable(routingTable)
  console.log(
    'urlVariablesTable >>>>',
    JSON.stringify(urlVariablesTable, null, 2)
  )

  expect(true).toBeTruthy()
})
