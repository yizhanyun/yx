# Pages content

## Support /abc/[def]/gh/[[...ids]].ext route

## types
1. HTML static
1.1 Dev - server static
1.2 Build - optimize and rewrite resources if necessary
1.3 Prod - server static

2. non-file-routing template file

2.1 With .boot.js

Dev:

- with getServerProps : run getServerProps, pass result to template engine
- with no getServerProps but with getStaticProps: run getStaticProps, pass result to template engine
- with neither: run template engine

Build

-with getServerProps: server side
-with getStaticProps: run getStatic, pass to template, generate page

Prod
-with getServerProps: server side
-serve generated html

2.2. With no .boot.js
- run template engine always

3. file-routing template file

3.1 with .boot.js


Dev:

- with getServerProps : run getServerProps with params, pass result to template engine to generate html
- with no getServerProps but with getStaticProps: run getStaticProps with params, pass result to template engine to generate html
- with neither: run template engine

Build

-with getServerProps: server side
-with getStaticPaths (with/without getStaticProps) : run getStatic, pass to template, generate page

Prod
-with getServerProps: server side
-serve generated html
-with getStaticPaths and fallback ? : generate html then serve them

2.2. With no .boot.js
- run template engine always

## Catch route handler

1. Check if /<segments>/abc.html exists
- yes, serve it
- no, check if getStaticPaths and/or get static props exists, yes generate static html, write to disk, then serve it. still no, getServerProps, server side render.

## Universal render with catchRouter & file router

### catch router

1. resolve url to static file, yes send file
2. resolve to template
- with .boot.mjs, getServerProps, render server side
- with getStaticProps, getStaticProps, render static html, write to disk, send to client