import express from 'express';
import strings from '../config/strings';
import assets from './v1/assets';

const routes = express.Router();

routes.use('/v1/assets', assets);
routes.use('/assets', assets);


routes.get('/', (req, res) => {
  res.status(200).json({ message: strings.success.ok });
});

routes.use((req, res) => {
  res.status(404).send({
    success: false,
    message: strings.error.resourceNotFound,
  });
});

export default routes;
