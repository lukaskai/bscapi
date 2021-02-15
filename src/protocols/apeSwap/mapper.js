import farmsConfig from './constants/farms';
import { getFullDisplayBalance, getLiquidityValue } from '../shared/helpers';
import config from '../../config';

export const getAddress = (address) => address[config.web3.CHAIN_ID];

export default {
  mapToRawData: (lpTokensUnderlying,
    userLpTokenBalances,
    userStakedBalances) => {
    const rawData = {};

    console.log({
      lpTokensUnderlying,
      userLpTokenBalances,
      userStakedBalances,
    });

    lpTokensUnderlying.forEach((underlying, index) => {
      const farmPool = farmsConfig[index];
      const stakedBalanceInPoolRaw = userStakedBalances[index];
      const balanceInPoolRaw = userLpTokenBalances[index];

      if (stakedBalanceInPoolRaw.gt(0)
          || balanceInPoolRaw.gt(0)) {
        rawData[farmPool.lpSymbol] = {
          tokenSymbol: farmPool.tokenSymbol,
          quoteTokenSymbol: farmPool.quoteTokenSymbol,
          lpSymbol: farmPool.lpSymbol,
          tokenAddress: getAddress(farmPool.tokenAddresses),
          quoteTokenAddress: getAddress(farmPool.quoteTokenAdresses),
          stakedLpTokenBalance: getFullDisplayBalance(stakedBalanceInPoolRaw, underlying.lpTokenDecimals),
          lpTokenBalances: getFullDisplayBalance(balanceInPoolRaw, underlying.lpTokenDecimals),
          totalLpTokenBalance:
              getFullDisplayBalance(balanceInPoolRaw.plus(stakedBalanceInPoolRaw),
                underlying.lpTokenDecimals),
        };

        rawData[farmPool.lpSymbol].totalUnderlyingTokenBalance = getLiquidityValue(
          underlying.underlyingTokenSupply,
          underlying.lpTotalSupply,
          rawData[farmPool.lpSymbol].totalLpTokenBalance,
        );

        rawData[farmPool.lpSymbol].totalUnderlyingQuoteTokenBalance = getLiquidityValue(
          underlying.underlyingQuoteTokenSupply,
          underlying.lpTotalSupply,
          rawData[farmPool.lpSymbol].totalLpTokenBalance,
        );
      }
    });

    return rawData;
  },
};
