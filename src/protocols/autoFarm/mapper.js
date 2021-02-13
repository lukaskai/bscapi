import farmsConfig from './constants/farms';
import { getAddress, getFullDisplayBalance, getLiquidityValue } from './helpers';

export const mapRawToUnderlyingA = (rawData) => {
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

export const mapToRawDataA = (stakedSimpleTokens, enrichedLpUnderlyingTokens) => {
  const rawData = {};

  enrichedLpUnderlyingTokens.forEach((e) => {
    if (e.rawStakedBalance.gt(0)) {
      const lpSymbol = `${e.baseTokenSymbol}-${e.quoteTokenSymbol} LP`;
      rawData[lpSymbol] = {
        tokenSymbol: e.baseTokenSymbol,
        quoteTokenSymbol: e.quoteTokenSymbol,
        lpSymbol,
        tokenAddress: e.baseTokenAddress,
        quoteTokenAddress: e.quoteTokenAddress,
        stakedLpTokenBalance: getFullDisplayBalance(e.rawStakedBalance, e.decimals),
      };

      console.log(e.baseTokenLpBalance, e.baseTokenDecimals);

      rawData[lpSymbol].totalUnderlyingTokenBalance = getLiquidityValue(
        getFullDisplayBalance(e.baseTokenLpBalance, e.baseTokenDecimals),
        getFullDisplayBalance(e.lpTotalSupply, e.decimals),
        getFullDisplayBalance(e.rawStakedBalance, e.decimals),
      );

      rawData[lpSymbol].totalUnderlyingQuoteTokenBalance = getLiquidityValue(
        getFullDisplayBalance(e.quoteTokenLpBalance, e.quoteTokenDecimals),
        getFullDisplayBalance(e.lpTotalSupply, e.decimals),
        getFullDisplayBalance(e.rawStakedBalance, e.decimals),
      );
    }
  });

  return rawData;
};
