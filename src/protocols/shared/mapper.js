export default {
  mapRawToUnderlying: (rawData) => {
    const underlying = {};

    Object.keys(rawData).forEach((dataKey) => {
      const entry = rawData[dataKey];
      entry.tokenSymbol = entry.tokenSymbol.toUpperCase();

      if (underlying[entry.tokenSymbol]) {
        underlying[entry.tokenSymbol].amount += entry.totalUnderlyingTokenBalance;
      } else {
        underlying[entry.tokenSymbol] = {
          amount: entry.totalUnderlyingTokenBalance,
          symbol: entry.tokenSymbol,
          tokenAddress: entry.tokenAddress,
        };
      }

      if (entry.quoteTokenSymbol && entry.totalUnderlyingQuoteTokenBalance) {
        entry.quoteTokenSymbol = entry.quoteTokenSymbol.toUpperCase();
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
};
