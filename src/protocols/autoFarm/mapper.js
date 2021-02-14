import { getFullDisplayBalance, getLiquidityValue } from '../shared/helpers';

export default {
  mapToRawData: (stakedSimpleTokens, enrichedLpUnderlyingTokens) => {
    const rawData = {};

    enrichedLpUnderlyingTokens.forEach((e) => {
      if (e.rawStakedBalance.gt(0) && getFullDisplayBalance(e.rawStakedBalance, e.decimals) > 0) {
        const lpSymbol = `${e.baseTokenSymbol}-${e.quoteTokenSymbol} LP`;
        rawData[lpSymbol] = {
          tokenSymbol: e.baseTokenSymbol,
          quoteTokenSymbol: e.quoteTokenSymbol,
          lpSymbol,
          lpTokenAddress: e.tokenAddress,
          tokenAddress: e.baseTokenAddress,
          quoteTokenAddress: e.quoteTokenAddress,
          stakedLpTokenBalance: getFullDisplayBalance(e.rawStakedBalance, e.decimals),
          pid: e.pid,
        };

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
    stakedSimpleTokens.forEach((e) => {
      if (e.rawStakedBalance.gt(0) && getFullDisplayBalance(e.rawStakedBalance, e.decimals) > 0) {
        const symbol = `${e.symbol}`;
        rawData[symbol] = {
          tokenSymbol: symbol,
          tokenAddress: e.tokenAddress,
          stakedTokenBalance: getFullDisplayBalance(e.rawStakedBalance, e.decimals),
          totalUnderlyingTokenBalance: getFullDisplayBalance(e.rawStakedBalance, e.decimals),
          pid: e.pid,
        };
      }
    });

    return rawData;
  },
};
