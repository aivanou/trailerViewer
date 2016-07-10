=======================================================================================
Trailer viewer
======================================================================================

Build.

1. npm install
2. grunt run

In order to start the server with all tests, execute: grunt start


Tools used:

1. node.js
2. express
3. ejs -- template framework for processing data on front layer
4. Grunt 
5. Promise/q library 
6. Winston
7. Mocha/chai/supertest

In future, the front layer frameworks could be introduced like Angular.js or React.js.
It will completely separate the server side and the client side.


The trailers can be accessed via url:  http://localhost:3001/pc-se/film/:filmId, where :filmId is the id of a film, e.g. 'titanic-1997'.

There always will be a single trailer to show.

The solution concentrates strength on the server part, and lacks the good UI view.

The trailerViewer first check the data in cache, and if it registers a miss, two consecutive requests are made for fetching film information from content.via server and for getting the trailer information from trailer addict. 