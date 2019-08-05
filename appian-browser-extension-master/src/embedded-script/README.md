This code can be built and imported by the embedded html page.
In the browser extension, that page is hosted in the iframe and generated by a WebAPI.
In order to iterate on the script that is imported by that page, it can be built here
and then the resulting generated file (build/static/js/embeddedScript.js) can be
copied and used in the WebAPI.

For testing purposes, the embedded page is mimicked in testEntry.html.
This can be reached by running the webpack dev server and browsing to localhost:3030/testEntry.html.
You will need to override CORS and other headers in order to get embedded to work.