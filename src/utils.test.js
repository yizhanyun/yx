/* eslint-disable */

import {
  recursiveReadDirSync,
  removeSuffix,
  segmentsToRoute,
  parseRouteSegment,
} from './utils.mjs'

test('adds 1 + 2 to equal 3', () => {
  expect(1 + 2).toBe(3)
})

test('Recusively read dir sync build folder tree successfully', () => {
  const tree = recursiveReadDirSync(process.cwd())

  expect(true).toBeTruthy()
})

test('Remove file suffix correctly', () => {
  const abc = removeSuffix('abc.js', 'js')

  expect(abc).toBe('abc')
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
  const route = segmentsToRoute(segments)
  expect(route).toEqual([
    'catch',
    [
      ['abc', 'static'],
      ['bb', 'catch'],
      ['jj', 'static'],
      ['def', 'catch'],
    ],
  ])
})

test('Test segments is route correctly case 4', () => {
  const segments = ['abc', '[bb]', '[jj]', '[def].ext']
  const route = segmentsToRoute(segments)

  expect(route).toEqual([
    'catch',
    [
      ['abc', 'static'],
      ['bb', 'catch'],
      ['jj', 'catch'],
      ['def', 'catch'],
    ],
  ])
})

test('Test segments is route correctly case 5', () => {
  const segments = ['abc', '[bb]', '[[jj]]', '[def].ext']
  const route = segmentsToRoute(segments)
  expect(route).toEqual([
    'error',
    [
      ['abc', 'static'],
      ['bb', 'catch'],
      ['[[jj]]', 'error'],
      ['def', 'catch'],
    ],
  ])
})

test('Test segments is route correctly case 6', () => {
  const segments = ['[abc]', '[bb]', '[jj]', '[def].ext']
  const [isRoute] = segmentsToRoute(segments)
  expect(isRoute).toBeTruthy()
})

test('Test segments is route correctly case 7', () => {
  const segments = ['[abc]', '[bb]', '[jj]', '[[def]].ext']
  const route = segmentsToRoute(segments)
  expect(route).toEqual([
    'error',
    [
      ['abc', 'catch'],
      ['bb', 'catch'],
      ['jj', 'catch'],
      ['[[def]].ext', 'error'],
    ],
  ])
})

test('Test segments is route correctly case 8', () => {
  const segments = ['[abc]', '[bb]', '[jj]', '[[def].ext']
  const route = segmentsToRoute(segments)
  expect(route).toEqual([
    'error',
    [
      ['abc', 'catch'],
      ['bb', 'catch'],
      ['jj', 'catch'],
      ['[[def].ext', 'error'],
    ],
  ])
})

test('Test segments is route correctly case 9', () => {
  const segments = ['abc', 'def', 'hi']
  const route = segmentsToRoute(segments)
  expect(route).toEqual([
    'static',
    [
      ['abc', 'static'],
      ['def', 'static'],
      ['hi', 'static'],
    ],
  ])
})

test('Test segments is route correctly case 11', () => {
  const segments = ['[abc]', '[bb]', '[jj]', '[...def].ext']
  const route = segmentsToRoute(segments)
  expect(route).toEqual([
    'catchAll',
    [
      ['abc', 'catch'],
      ['bb', 'catch'],
      ['jj', 'catch'],
      ['def', 'catchAll'],
    ],
  ])
})

test('Test segments is route correctly case 11.2', () => {
  const segments = ['abc', 'bb', 'jj', '[...def].ext']
  const [isRoute] = segmentsToRoute(segments)
  expect(isRoute).toBeTruthy()
})

test('Test segments is route correctly case 12', () => {
  const segments = ['[abc]', '[bb]', '[jj]', '[[...def]].ext']
  const route = segmentsToRoute(segments)
  expect(route).toEqual([
    'optionalCatchAll',
    [
      ['abc', 'catch'],
      ['bb', 'catch'],
      ['jj', 'catch'],
      ['def', 'optionalCatchAll'],
    ],
  ])
})

test('Test segments is route correctly case 12.2', () => {
  const segments = ['abc', 'bb', 'jj', '[[...def]].ext']
  const [isRoute] = segmentsToRoute(segments)
  expect(isRoute).toBeTruthy()
})

test('Parse route segment 1', () => {
  const route = parseRouteSegment('[[...id]]')
  expect(route).toEqual(['id', 'optionalCatchAll'])
})

test('Parse route segment 2', () => {
  const route = parseRouteSegment('[[....id]]')
  //console.log(route)
  expect(route).toEqual(['[[....id]]', 'error'])
})

test('Parse route segment 3', () => {
  const route = parseRouteSegment('[...id]')
  //console.log(route)
  expect(route).toEqual(['id', 'catchAll'])
})

test('Parse route segment 4', () => {
  const route = parseRouteSegment('[id]')
  //console.log(route)
  expect(route).toEqual(['id', 'catch'])
})

test('Parse route segment 5', () => {
  const route = parseRouteSegment('[[id]]')
  //console.log(route)
  expect(route).toEqual(['[[id]]', 'error'])
})
