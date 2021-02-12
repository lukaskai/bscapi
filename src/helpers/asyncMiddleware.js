import { validationResult } from 'express-validator';

function getDecoratedJsonFn(res, sendJson) {
  return function json(string) {
    const body = string;

    if (body) res.bodyString = body;

    sendJson.call(this, body);
  };
}

export default (fn) => (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const err = new Error('INVALID_REQUEST');
    err.statusCode = 422;
    err.errorCode = result.errors[0].msg;
    throw err;
  }

  console.log('API call request', {
    url: req.originalUrl,
    params: req.params,
    body: req.body,
  });

  res.json = getDecoratedJsonFn(res, res.json);

  return Promise.resolve(fn(req, res, next)).then(() => {
    const resBodyToLog = { ...res.bodyString };
    delete resBodyToLog.privateKey;

    console.log('API call response', {
      url: req.originalUrl,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      body: resBodyToLog,
    });
  }).catch((err) => {
    console.log('Error', err);
    next(err);
  });
};
