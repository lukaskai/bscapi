import farmsConfig from './constants/farms';
import { getAddress, getFullDisplayBalance, getLiquidityValue } from './helpers';

export const mapRawToUnderlying = (rawData) => {
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

  return underlying;
};

export const mapToRawData = (lpTokensUnderlying,
  userLpTokenBalances,
  userStakedBalances) => {
  const rawData = {};

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
};
