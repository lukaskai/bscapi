export default {
  mapRawToUnderlying: (rawData) => {
    const underlying = {};

    rawData.forEach((entry) => {
      entry.underlyingSymbol = entry.underlyingSymbol.toUpperCase();
      if (entry.balanceUnderlying > 0) {
        underlying[entry.underlyingSymbol] = {
          amount: entry.balanceUnderlying,
          symbol: entry.underlyingSymbol,
          tokenAddress: entry.underlyingAddress,
        };
      }
    });

    return underlying;
  },
  mapRawToDebt: (rawData) => {
    const debt = {};

    rawData.forEach((entry) => {
      entry.underlyingSymbol = entry.underlyingSymbol.toUpperCase();
      if (entry.debtBalance > 0) {
        debt[entry.underlyingSymbol] = {
          amount: entry.debtBalance,
          symbol: entry.underlyingSymbol,
          tokenAddress: entry.underlyingAddress,
        };
      }
    });

    return debt;
  },
};
