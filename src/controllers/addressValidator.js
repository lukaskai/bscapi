import { param } from 'express-validator';
import WAValidator from 'wallet-address-validator';
import errors from '../config/errors';

export default [
  param('address').custom((value) => WAValidator.validate(value, 'ETH')).withMessage(errors.INVALID_ADDRESS),
];
