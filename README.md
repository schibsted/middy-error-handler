# Schibsted Middy error handler middleware

![github checks](https://badgen.net/github/checks/schibsted/middy-error-handler)
![current version @ npm](https://badgen.net/npm/v/@schibsted/middy-error-handler)
![weekly downloads @ npm](https://badgen.net/npm/dw/@schibsted/middy-error-handler)
![minified size](https://badgen.net//bundlephobia/min/@schibsted/middy-error-handler)

#### HTTP error handler middleware for the middy framework, the stylish Node.js middleware engine for AWS Lambda

Automatically handles any uncaught errors and creates a proper HTTP response
for them (using the message and the status code provided by the error object). We recommend generating these HTTP errors with the npm module [`http-errors`](https://npm.im/http-errors).

This middleware should be set as the last error handler unless you also want to register the `http-reponse-serializer`. If so, this middleware should come second-last and the `http-response-serializer` should come last.

This is an alternative to [standard Middy error handler](https://github.com/middyjs/middy/tree/master/packages/http-error-handler) with the following differences:

- it always returns JSON object and not text
- it handles any uncaught error, not just the ones with `statusCode` and `message`

## Install

To install this middleware you can use NPM:

```bash
npm install --save @schibsted/middy-error-handler
```

## Options

- `logger` (defaults to `console`) - a logging function that is invoked with the current error as an argument. You can pass `false` if you don't want the logging to happen.
- `level` (defaults to `error`) - log level to use for the error log entry
- `exposeStackTrace` (defaults to `false`) - if `true`, the stack trace will be exposed in the response body
- `filter` (function, defaults to always returning `true`) - a function that is invoked with the current error as an argument. If it returns `true`, the error is logged and its stack trace returned as long as `exposeStackTrace` is also true, otherwise it is not.

## Sample usage

### with mostly default params

```javascript
const middy = require('@middy/core');
const createError = require('http-errors');
const errorHandler = require('@schibsted/middy-error-handler');

const handler = middy(() => {
    throw new createError.ServiceUnavailable('Service not available');
});

handler.use(errorHandler({exposeStackTrace: true}));

handler({}, {}).then((response) => {
    console.log(response);

    // {
    //     statusCode: 503,
    //     body: '{"statusCode":503,"message":"Service not available","stack":"..."}'
    //     stack: '...'
    // }
});

```

### with custom logger and filtering out 404 errors

```javascript
const middy = require('@middy/core');
const createError = require('http-errors');
const errorHandler = require('@schibsted/middy-error-handler');
const { LambdaLog } = require('lambda-log');

const logger = new LambdaLog({
    tags: ['foobar'],
});

const handler = middy(() => {
    throw new createError.ServiceUnavailable('Service not available');
});

handler.use(errorHandler({ 
    filter: (err) => err.statusCode !== 404, // don't log 404 errors, they happen a lot
    logger 
}));

handler({}, {}).then((response) => {
    // same + also executes logger.error function

    console.log(response);

    // {
    //     statusCode: 503,
    //     body: '{"statusCode":503,"message":"Service not available","stack":"..."}'
    //     stack: '...'
    // }
});
```

## Contributing

Everyone is very welcome to contribute to this repository. Feel free to [raise issues](https://github.com/schibsted/middy-error-handler/issues) or to [submit Pull Requests](https://github.com/schibsted/middy-error-handler/pulls).
