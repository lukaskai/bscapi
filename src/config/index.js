/* eslint-disable */
import dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
const $ = process.env;

export default {
  server: {
    port: parseInt($.SERVER_PORT),
    host: $.SERVER_HOST,
    hostUrl: $.SERVER_HOST_URL,
  },
  web3: {
    HTTP_PROVIDER: $.WEB3_HTTP_PROVIDER,
    CHAIN_ID: parseInt($.WEB3_CHAIN_ID),
  },
  math: {
    DECIMALS_FOR_DISPLAY: parseInt($.DECIMALS_FOR_DISPLAY)
  }
};
