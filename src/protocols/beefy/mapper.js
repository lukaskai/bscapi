import { getFullDisplayBalance, getLiquidityValue } from '../shared/helpers';

export default {
  mapToRawData: (stakedSimpleTokens, enrichedLpUnderlyingTokens) => {
    const rawData = {};

    enrichedLpUnderlyingTokens.forEach((e) => {
      const lpSymbol = `${e.baseTokenSymbol}-${e.quoteTokenSymbol} LP`;
      rawData[lpSymbol] = {
        tokenSymbol: e.baseTokenSymbol,
        quoteTokenSymbol: e.quoteTokenSymbol,
        lpSymbol,
        lpTokenAddress: e.tokenAddress,
        tokenAddress: e.baseTokenAddress,
        quoteTokenAddress: e.quoteTokenAddress,
        stakedLpTokenBalance: e.rawStakedBalance,
      };

      rawData[lpSymbol].totalUnderlyingTokenBalance = getLiquidityValue(
        getFullDisplayBalance(e.baseTokenLpBalance, e.baseTokenDecimals),
        getFullDisplayBalance(e.lpTotalSupply, e.tokenDecimals),
        e.rawStakedBalance,
      );

      rawData[lpSymbol].totalUnderlyingQuoteTokenBalance = getLiquidityValue(
        getFullDisplayBalance(e.quoteTokenLpBalance, e.quoteTokenDecimals),
        getFullDisplayBalance(e.lpTotalSupply, e.tokenDecimals),
        e.rawStakedBalance,
      );
    });
    stakedSimpleTokens.forEach((e) => {
      const symbol = `${e.token}`;
      rawData[symbol] = {
        tokenSymbol: symbol,
        tokenAddress: e.tokenAddress,
        stakedTokenBalance: e.rawStakedBalance,
        totalUnderlyingTokenBalance: e.rawStakedBalance,
      };
    });

    return rawData;
  },
};
