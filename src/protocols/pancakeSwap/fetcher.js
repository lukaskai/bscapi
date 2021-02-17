import farmsConfig from './constants/farms';
import addresses from './constants/contracts';
import swapFetcher from '../shared/swapFetcher';
import { getMasterChefAddress } from '../shared/helpers';

export default {
  fetchLpTokenBalances: async (account) => swapFetcher.fetchLpTokenBalances(farmsConfig, account),

  fetchFarmUserStakedBalances: async (account) => {
    const masterChefAddress = getMasterChefAddress(addresses);
    return swapFetcher.fetchFarmUserStakedBalances(masterChefAddress, farmsConfig, account);
  },

  fetchPools: async () => swapFetcher.fetchPools(farmsConfig),
};
