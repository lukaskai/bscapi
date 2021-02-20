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
    DECIMALS_FOR_DISPLAY: parseInt($.DECIMALS_FOR_DISPLAY),
    DECIMALS_DEFAULT: parseInt($.DECIMALS_DEFAULT)
  },
  addresses: {
    MULTI_CALL_ADDRESS: $.MULTI_CALL_ADDRESS
  },
  external: {
    PANCAKE_SWAP_TOKEN_ENDPOINT: $.PANCAKE_SWAP_TOKEN_ENDPOINT,
    PANCAKE_SWAP_TOKEN_CACHE_HOURS: parseInt($.PANCAKE_SWAP_TOKEN_CACHE_HOURS),
  }
};
