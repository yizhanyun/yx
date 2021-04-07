/* eslint-disable */

import path from 'path'

import {
  recursiveReadDirSync,
  removeSuffix,
  segmentsToRoute,
  buildFileRoutingTable,
  buildFileRouteUrlVariableTable,
} from './utils.mjs'

test('Parse route segments new 1', () => {
  const routeTable = segmentsToRoute(['abc', 'def', '[mm].ejs'])
  // console.log(routeTable)
  expect(routeTable[0]).toBe('catch')
})

test('Parse route segments new 2', () => {
  const routeTable = segmentsToRoute(['abc', 'def', '[...mm].ejs'])
  //console.log(routeTable)
  expect(routeTable[0]).toBe('catchAll')
})

test('Parse route segments new 3', () => {
  const routeTable = segmentsToRoute(['abc', 'def', '[[...mm]].ejs'])
  //console.log(routeTable)
  expect(routeTable[0]).toBe('optionalCatchAll')
})

test('Parse route segments new 4', () => {
  const routeTable = segmentsToRoute(['abc', 'def', '[[mm]].ejs'])
  //console.log(routeTable)
  expect(routeTable[0]).toBe('error')
})

test('Parse route segments new 5', () => {
  const routeTable = segmentsToRoute(['$$abc', 'def', '[[...mm]].ejs'])
  //console.log(routeTable)
  expect(routeTable[0]).toBe('optionalCatchAll')
})

test('Parse route segments new 6', () => {
  const routeTable = segmentsToRoute(['abc', '[def]', 'gg', '[[...mm]].ejs'])
  //console.log(routeTable)
  expect(routeTable[0]).toBe('optionalCatchAll')
})

test('Parse route segments new 7', () => {
  const routeTable = segmentsToRoute(['abc', '[def]', '[gg]', '[[...mm]].ejs'])
  //console.log(routeTable)
  expect(routeTable[0]).toBe('optionalCatchAll')
})

test('Parse route segments new 8', () => {
  const routeTable = segmentsToRoute(['abc', '[def]', '[gg]', '[...mm].ejs'])
  //console.log(routeTable)
  expect(routeTable[0]).toBe('catchAll')
})

test('Parse route segments new 9', () => {
  const routeTable = segmentsToRoute(['abc', '[def]', '[gg]', '[mm].ejs'])
  //console.log(routeTable)
  expect(routeTable[0]).toBe('catch')
})

test('Parse route segments new 10', () => {
  const routeTable = segmentsToRoute(['[abc]', '[def]', '[gg]', '[mm].ejs'])
  //console.log(routeTable)
  expect(routeTable[0]).toBe('catch')
})

test('Parse route segments new 11', () => {
  const routeTable = segmentsToRoute(['abc', 'def', 'gg', 'mm.ejs'])
  //console.log(routeTable)
  expect(routeTable[0]).toBe('static')
})

test('Parse route segments new 12', () => {
  const routeTable = segmentsToRoute(['mm.ejs'])
  //console.log(routeTable)
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
  //console.log(routeTable)
  expect(routeTable[0]).toBe('catch')
})

test('Parse route segments new 14', () => {
  const routeTable = segmentsToRoute(['about', 'index.html'])
  //console.log(routeTable)
  expect(routeTable[0]).toBe('static')
})
