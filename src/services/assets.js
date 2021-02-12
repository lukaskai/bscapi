import {
  fetchFarmUserTokenBalances,
  fetchFarmUserStakedBalances,
  fetchFarmUserEarnings,
} from '../clients/pancakeSwap/fetcher';
import farmsConfig from '../clients/pancakeSwap/constants/farms';

export const getAddress = (address) => {
  const mainNetChainId = 56;
  return address[mainNetChainId];
};

export default {
  async getAssets(address) {
    // const userFarmTokenBalances = await fetchFarmUserTokenBalances(address);
    const userStakedBalances = await fetchFarmUserStakedBalances(address);
    // const userFarmEarnings = await fetchFarmUserEarnings(address);

    const underlying = {};

    userStakedBalances.forEach((balances, index) => {
      underlying[farmsConfig[index].tokenSymbol] = {
        tokenAddress: getAddress(farmsConfig[index].tokenAddresses),
        symbol: farmsConfig[index].tokenSymbol,
        stakedBalance: userStakedBalances[index],
      };
    });

    return {
      asset: {
        PancakeSwap: {
          underlying,
        },
      },
      walletId: address,
    };
  },
};
