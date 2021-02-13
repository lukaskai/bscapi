import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import config from './config';
import strings from './config/strings';
import routes from './routes';
import errorHandler from './helpers/errorHandler';

dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const app = express();

app.use(helmet());
app.use(cors());
app.options('*', cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '1mb', extended: true }));
app.use(morgan((tokens, req, res) => {
  const json = {
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: tokens.status(req, res),
    contentLength: tokens.res(req, res, 'content-length'),
    responseTimeMs: Number(Math.ceil(tokens['response-time'](req, res))),
  };
  console.log('API called', json);
}));
app.use('/', routes);
app.use(errorHandler);
app.disable('etag');

const port = process.env.PORT || config.server.port;
const server = app.listen(port, () => console.log(strings.success.apiStarted + port));
export default server;

process.on('uncaughtException', (err) => {
  const errorMessage = `UncaughtException: ${err.message} ${err.stack}`;
  console.error(`${new Date().toUTCString()} ${errorMessage}`, err);
});

process.on('unhandledRejection', (err) => {
  const errorMessage = `UnhandledRejection: ${err.message} ${err.stack}`;
  console.error(`${new Date().toUTCString()} ${errorMessage}`, err);
});
