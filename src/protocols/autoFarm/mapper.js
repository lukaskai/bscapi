import { getFullDisplayBalance, getLiquidityValue } from '../shared/helpers';

export default {
  mapRawToUnderlying: (rawData) => {
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

      if (entry.quoteTokenSymbol) {
        if (underlying[entry.quoteTokenSymbol]) {
          underlying[entry.quoteTokenSymbol].amount += entry.totalUnderlyingQuoteTokenBalance;
        } else {
          underlying[entry.quoteTokenSymbol] = {
            amount: entry.totalUnderlyingQuoteTokenBalance,
            symbol: entry.quoteTokenSymbol,
            tokenAddress: entry.quoteTokenAddress,
          };
        }
      }
    });

    return underlying;
  },

  mapToRawData: (stakedSimpleTokens, enrichedLpUnderlyingTokens) => {
    const rawData = {};

    enrichedLpUnderlyingTokens.forEach((e) => {
      if (e.rawStakedBalance.gt(0)) {
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

        console.log({
          stakedLpTokenBalance: getFullDisplayBalance(e.rawStakedBalance, e.decimals),
          baseLpBalance: getFullDisplayBalance(e.baseTokenLpBalance, e.baseTokenDecimals),
          lpTotalSupply: getFullDisplayBalance(e.lpTotalSupply, e.decimals),
        });

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
      if (e.rawStakedBalance.gt(0)) {
        console.log(e);
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
