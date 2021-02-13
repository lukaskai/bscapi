import {
  fetchLpTokenBalances,
  fetchFarmUserStakedBalances, fetchFarms,
} from '../clients/pancakeSwap/fetcher';
import farmsConfig from '../clients/pancakeSwap/constants/farms';

export const getAddress = (address) => {
  const mainNetChainId = 56;
  return address[mainNetChainId];
};

function getLiquidityValue(
  underlyingTokenReserve,
  totalLpTokenSupply,
  userLpTokenLiquidity,
) {
  return (userLpTokenLiquidity * underlyingTokenReserve) / totalLpTokenSupply;
}

export default {
  async getAssets(address) {
    const lpTokensUnderlying = await fetchFarms();
    const userLpTokenBalances = await fetchLpTokenBalances(address);
    const userStakedBalances = await fetchFarmUserStakedBalances(address);
    const rawData = {};

    userStakedBalances.forEach((balances, index) => {
      if (userStakedBalances[index].displayBalance > 0
          || userLpTokenBalances[index].displayBalance) {
        rawData[farmsConfig[index].lpSymbol] = {
          tokenSymbol: farmsConfig[index].tokenSymbol,
          quoteTokenSymbol: farmsConfig[index].quoteTokenSymbol,
          lpSymbol: farmsConfig[index].lpSymbol,
          tokenAddress: getAddress(farmsConfig[index].tokenAddresses),
          quoteTokenAddress: getAddress(farmsConfig[index].quoteTokenAdresses),
          stakedLpTokenBalance: userStakedBalances[index].displayBalance,
          lpTokenBalances: userLpTokenBalances[index].displayBalance,
          totalLpTokenBalance: userLpTokenBalances[index].displayBalance + userStakedBalances[index].displayBalance,
        };

        rawData[farmsConfig[index].lpSymbol].totalUnderlyingTokenBalance = getLiquidityValue(
          lpTokensUnderlying[index].underlyingTokenSupply,
          lpTokensUnderlying[index].lpTotalSupply,
          rawData[farmsConfig[index].lpSymbol].totalLpTokenBalance,
        );

        rawData[farmsConfig[index].lpSymbol].totalUnderlyingQuoteTokenBalance = getLiquidityValue(
          lpTokensUnderlying[index].underlyingQuoteTokenSupply,
          lpTokensUnderlying[index].lpTotalSupply,
          rawData[farmsConfig[index].lpSymbol].totalLpTokenBalance,
        );
      }
    });


    const underlying = {};

    Object.keys(rawData).forEach((dataKey) => {
      const entry = rawData[dataKey];
      if (underlying[entry.tokenSymbol]) {
        underlying[entry.tokenSymbol].amount += entry.totalUnderlyingTokenBalance;
      } else {
        underlying[entry.tokenSymbol] = {
          amount: entry.totalUnderlyingTokenBalance,
          symbol: entry.tokenSymbol,
          tokenAddress: entry.tokenAddress,
        };
      }
      if (underlying[entry.quoteTokenSymbol]) {
        underlying[entry.quoteTokenSymbol].amount += entry.totalUnderlyingQuoteTokenBalance;
      } else {
        underlying[entry.quoteTokenSymbol] = {
          amount: entry.totalUnderlyingQuoteTokenBalance,
          symbol: entry.quoteTokenSymbol,
          tokenAddress: entry.quoteTokenAddress,
        };
      }
    });


    return {
      asset: {
        PancakeSwap: {
          underlying,
          rawData,
        },
      },
      walletId: address,
    };
  },
};
