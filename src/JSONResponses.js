const users = {};
const crypto = require('crypto');

let etag = crypto.createHash('sha1').update(JSON.stringify(users));
let digest = etag.digest('hex');


// return a json response to the page
const respondJSON = (request, response, status, object) => {
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };

  response.writeHead(status, headers);
  response.write(JSON.stringify(object));
  response.end();
};

// return a response without a json body
const respondJSONMeta = (request, response, status) => {
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };

  // send the response just with headers
  console.log('sending head');
  response.writeHead(status, headers);
  response.end();
};

// handle get user request
const getUsers = (request, response) => {
  // start with the JSON object
  const responseJSON = {
    users,
  };

  console.dir(users);
  // see if the header tag is the same coming in
  if (request.headers['if-none-match'] === digest) {
    // return 304 in head

    return respondJSONMeta(request, response, 304);
  }

  console.log('sending with body');
  // return as if it is new 
  return respondJSON(request, response, 200, responseJSON);
};

// head for get user request
const getUsersHead = (request, response) => {
  console.log(digest);
  console.log(request.headers['if-none-match']);

  // return a 304 without a message
  if (request.headers['if-none-match'] === digest) {
    console.log('test');
    return respondJSONMeta(request, response, 304);
  }

  // return a 200 without a message
  return respondJSONMeta(request, response, 200);
};

// add users
const addUser = (request, response, body) => {
  // default message
  const responseJSON = {
    message: 'Name and age are both required',
  };
    // if any are missing send back a 400 page
  if (!body.name || !body.age) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 201;

  // if it exist, switch RC to 204
  if (users[body.name]) {
    responseCode = 204;
  } else {
    users[body.name] = {};
  }

  // add or update fields for this user
  users[body.name].name = body.name;
  users[body.name].age = body.age;

  console.dir(users);

  // if the user was created set our created message and response
  if (responseCode === 201) {
    responseJSON.message = 'Created Successfully';
    etag = crypto.createHash('sha1').update(JSON.stringify(users));
    digest = etag.digest('hex');

    return respondJSON(request, response, responseCode, responseJSON);
  }

  // if it is 204, return a success
  etag = crypto.createHash('sha1').update(JSON.stringify(users));
  digest = etag.digest('hex');
  return respondJSONMeta(request, response, responseCode);
};

const notReal = (request, response) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const objectsent = {
    id: 'notFound',
    message: 'The page you were looking for was not found',
  };

  response.writeHead(404, headers);
  response.write(JSON.stringify(objectsent));
  response.end();
};

const notRealMeta = (request, response) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  response.writeHead(404, headers);
  response.end();
};

module.exports.getUsers = getUsers;
module.exports.getUsersHead = getUsersHead;
module.exports.addUser = addUser;
module.exports.notReal = notReal;
module.exports.notRealMeta = notRealMeta;
