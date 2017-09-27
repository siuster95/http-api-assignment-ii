const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const JSONHandler = require('./JSONResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const GETURLHolder = {
  '/getUsers': JSONHandler.getUsers,
  '/': htmlHandler.getIndex,
  '/style.css': htmlHandler.getCSS,
  '/notReal': JSONHandler.notReal,
};

const HEADURLHolder = {
  '/notReal': JSONHandler.notRealMeta,
  '/getUsers': JSONHandler.getUsersHead,
};


const onRequest = (request, response) => {
  const urlparts = url.parse(request.url);
  console.log(request.method);
  switch (request.method) {
    case 'GET':
      if (GETURLHolder[urlparts.pathname]) {
        console.log('here');
        GETURLHolder[urlparts.pathname](request, response);
      } else {
        JSONHandler.notReal(request, response);
      }
      break;

    case 'HEAD':
      if (HEADURLHolder[urlparts.pathname]) {
        HEADURLHolder[urlparts.pathname](request, response);
      }
      break;

    case 'POST':
      if (urlparts.pathname === '/addUser') {
        const res = response;
        const body = [];

        request.on('error', (err) => {
          console.dir(err);
          res.statusCode = 400;
          res.end();
        });

        request.on('data', (chunk) => {
          body.push(chunk);
        });

        request.on('end', () => {
          const bodyString = Buffer.concat(body).toString();
          const bodyParams = query.parse(bodyString);

          JSONHandler.addUser(request, res, bodyParams);
        });
      }
      break;

    default:

      htmlHandler.getIndex(request, response);
  }
};

http.createServer(onRequest).listen(port);

console.log(`Listening on localhost on ${port}`);
