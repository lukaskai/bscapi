import errors from '../config/errors';

export default function errorHandler(err, req, res, next) {
  const errorBody = {
    errorType: 'API_ERROR',
    httpCode: 500,
    errorCode: 'INTERNAL_SERVER_ERROR',
    displayMessage: errors.INTERNAL_SERVER_ERROR,
  };

  if ([400, 422].includes(err.statusCode)) {
    errorBody.errorType = err.statusCode === 400 ? 'INVALID_INPUT' : 'INVALID_REQUEST';
    errorBody.httpCode = err.statusCode;
    errorBody.errorCode = err.errorCode;
    errorBody.displayMessage = errors[err.errorCode];
  }

  res.status(errorBody.httpCode).send(errorBody);
}
