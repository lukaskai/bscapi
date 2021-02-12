import express from 'express';
import assets from '../../controllers/assets';
import addressValidator from '../../controllers/addressValidator';

const routes = express.Router();

routes.get('/:address', addressValidator, assets.getAssets);

export default routes;
