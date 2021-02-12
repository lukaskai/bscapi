/* eslint-disable */
const $ = process.env;

export default {
  server: {
    port: parseInt($.SERVER_PORT),
    host: $.SERVER_HOST,
    hostUrl: $.SERVER_HOST_URL,
    env: $.DEVELOPMENT,
  },
  web3: {
    HTTP_PROVIDER: $.WEB3_HTTP_PROVIDER,
    CHAIN_ID: parseInt($.WEB3_CHAIN_ID),
    CHAIN: $.WEB3_CHAIN,
  },
};
