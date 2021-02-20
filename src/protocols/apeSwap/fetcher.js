import farmsConfig from './constants/farms';
import addresses from './constants/contracts';
import swapFetcher from '../shared/swapFetcher';
import { getMasterChefAddress } from '../shared/helpers';

export default {
  fetchFarmLpTokenBalances: async (account) => swapFetcher.fetchLpTokenBalances(farmsConfig, account),

  fetchFarmStakedLpTokenBalances: async (account) => {
    const masterChefAddress = getMasterChefAddress(addresses);
    return swapFetcher.fetchFarmUserStakedBalances(masterChefAddress, farmsConfig, account);
  },

  fetchFarmsLpTokensMetadata: async () => swapFetcher.fetchLpTokenMetadata(farmsConfig),
};
