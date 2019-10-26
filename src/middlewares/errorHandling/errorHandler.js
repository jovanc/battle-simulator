const errorMessage = require('./errorConstants');

module.exports = () => (err, req, res, next) => {
  const error = {};

  // console.log(err);

  switch (err.message) {
    case errorMessage.MISSING_PARAMETERS:
      error.message = 'Missing parameters';
      error.status = 400;
      error.errorCode = 1;
      break;
    case errorMessage.NOT_ACCEPTABLE:
      error.status = 406;
      error.message = 'Not acceptable';
      error.errorCode = 2;
      break;
    case errorMessage.NOT_FOUND:
      error.status = 404;
      error.message = 'Not Found';
      error.errorCode = 3;
      break;
    case errorMessage.BAD_REQUEST:
      error.status = 400;
      error.message = 'Bad Request';
      error.errorCode = 4;
      break;
    case errorMessage.DUPLICATE_INPUT:
      error.status = 409;
      error.message = 'Duplicate input';
      error.errorCode = 5;
      break;
    case errorMessage.INVALID_VALUE:
      error.status = 400;
      error.message = 'Invalid value';
      error.errorCode = 6;
      break;
    default:
      error.status = 500;
      error.message = 'Oops, an error occurred';
      error.errorCode = 0;
  }

  return res
    .status(error.status)
    .send(error);
};
