export default (condition, errorCode) => {
  if (!condition) {
    console.log('Validation error', { condition, errorCode });
    const err = new Error(errorCode);
    err.statusCode = 400;
    err.errorCode = errorCode;
    throw err;
  }
};
