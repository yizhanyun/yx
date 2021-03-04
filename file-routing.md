# File based routing rules

```
<segments>/[id].[ext] ->/<segments>/[:id]
<segments>/[a]/[b]/[..]/[m].[ext] -> /<segments>/:a/:b/.../:m
<segments>/[...abc].[ext] -> /<segments>/*
<segments>/[[...abc]].[ext] -> /<segments> && /<segments>/*

```

# Build handlers

## function

```
const buildHandler(filepath) => route with filepath closedOver
```

## route builder

```
const buildRoutes = (siteRoot, ext, buildHandler)  => [[routeUrl, handler],[...],...]
```

## path build rules

### Definitions

File system path:

```
- static: static route: /<segments>/abc.ext match /<segments>/abc.ext
- catch: single catch segment: /<segments>/[abc].ext match /<segments>/s1.ext
- catch: multiple catch segments : /<segments>/[a]/[b]/[c]/[d].ext
- catchAll: catch all segment: /<segments>/[...abc].ext match: /<segments>/<s1>/<s2>/....
- optionalCatchAll: optional cathc all /<segments>/[[...abc]].ext match /<segments> and /<segments>/<s1>/<s2>/....
```
Following are illigitmate:

1. mixed catch segments: /<segments>/[a]/b/[c]/[d].ext
2. multiple catch segments under same parent path: /<segments>/[a].ext, /<segments>/[b].ext, /<segments>/[..c].ext, /<segments>/[[...d]].ext

API route:

Same rules as above, with extension of .js.
