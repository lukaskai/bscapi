import got from 'got';
import farmsConfig from './constants/farms';
import addresses from './constants/contracts';
import swapFetcher from '../shared/swapFetcher';
import { getAddress, getMasterChefAddress } from '../shared/helpers';
import config from '../../config';
import cache from '../../helpers/cache';

const PANCAKE_SWAP_TOKEN_ENDPOINT = config.external.PANCAKE_SWAP_TOKEN_ENDPOINT;

export default {
  fetchLpTokens: async () => {
    const cacheValue = cache.get(PANCAKE_SWAP_TOKEN_ENDPOINT);
    if (cacheValue) return cacheValue;

    const response = await got(PANCAKE_SWAP_TOKEN_ENDPOINT);
    const tradePairs = JSON.parse(response.body).trade_pairs;
    const pairs = tradePairs.map((p) => {
      const farm = farmsConfig.find((f) => getAddress(f.lpAddresses) === p.swap_pair_contract);
      return {
        tokenSymbol: p.base_symbol,
        quoteTokenSymbol: p.quote_symbol,
        tokenAddresses: {
          56: p.base_address,
        },
        quoteTokenAdresses: {
          56: p.quote_address,
        },
        lpAddresses: {
          56: p.swap_pair_contract,
        },
        lpSymbol: `${p.base_symbol}-${p.quote_symbol}`,
        pid: farm ? farm.pid : undefined,
      };
    });

    const invalidationDate = new Date();
    invalidationDate.setHours(invalidationDate.getHours() + 1);

    cache.store(PANCAKE_SWAP_TOKEN_ENDPOINT, pairs, invalidationDate);


    return pairs;
  },

  fetchLpTokenBalances: async (tokens, account) => swapFetcher.fetchLpTokenBalances(tokens, account),

  fetchStakedLpTokenBalances: async (account) => {
    const masterChefAddress = getMasterChefAddress(addresses);
    return swapFetcher.fetchFarmUserStakedBalances(masterChefAddress, farmsConfig, account);
  },

  fetchLpTokenMetadata: async (lpTokens) => swapFetcher.fetchLpTokenMetadata(lpTokens),

};
