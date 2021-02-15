import farmsConfig from './constants/farms';
import config from '../../config';
import addresses from './constants/contracts';
import swapFetcher from '../shared/swapFetcher';

export const getAddress = (address) => address[config.web3.CHAIN_ID];
export const getMasterChefAddress = () => getAddress(addresses.masterChef);

export default {
  fetchLpTokenBalances: async (account) => swapFetcher.fetchLpTokenBalances(farmsConfig, account),

  fetchFarmUserStakedBalances: async (account) => {
    const masterChefAddress = getMasterChefAddress();
    return swapFetcher.fetchFarmUserStakedBalances(masterChefAddress, farmsConfig, account);
  },

  fetchPools: async () => swapFetcher.fetchPools(farmsConfig),
};
