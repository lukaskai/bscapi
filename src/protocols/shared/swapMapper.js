import BigNumber from 'bignumber.js';
import { getFullDisplayBalance, getLiquidityValue } from './helpers';
import config from '../../config';

export const getAddress = (address) => address[config.web3.CHAIN_ID];

export default {
  mapToRawData: (farmsConfig, lpTokensMetadata,
    lpTokensBalances,
    stakedLpTokensBalances) => {
    const rawData = {};

    lpTokensMetadata.forEach((underlying, index) => {
      const farmPoolIndex = farmsConfig.findIndex(
        (f) => getAddress(f.lpAddresses) === getAddress(underlying.lpAddresses),
      );

      const stakedBalanceInPoolRaw = farmPoolIndex > -1 ? stakedLpTokensBalances[farmPoolIndex] : new BigNumber(0);
      const balanceInPoolRaw = lpTokensBalances[index];

      if (stakedBalanceInPoolRaw.gt(0)
          || balanceInPoolRaw.gt(0)) {
        rawData[underlying.lpSymbol] = {
          tokenSymbol: underlying.tokenSymbol,
          quoteTokenSymbol: underlying.quoteTokenSymbol,
          lpSymbol: underlying.lpSymbol,
          tokenAddress: getAddress(underlying.tokenAddresses),
          quoteTokenAddress: getAddress(underlying.quoteTokenAdresses),
          stakedLpTokenBalance: getFullDisplayBalance(stakedBalanceInPoolRaw, underlying.lpTokenDecimals),
          lpTokenBalances: getFullDisplayBalance(balanceInPoolRaw, underlying.lpTokenDecimals),
          totalLpTokenBalance:
              getFullDisplayBalance(balanceInPoolRaw.plus(stakedBalanceInPoolRaw),
                underlying.lpTokenDecimals),
        };

        // If LP token and the token staked is the same, it means it is not LP
        // being staked, but the token itself inside pool
        if (getAddress(underlying.tokenAddresses) === getAddress(underlying.lpAddresses)) {
          rawData[underlying.lpSymbol]
            .totalUnderlyingTokenBalance = getFullDisplayBalance(balanceInPoolRaw.plus(stakedBalanceInPoolRaw),
              underlying.lpTokenDecimals);
          return;
        }

        rawData[underlying.lpSymbol].totalUnderlyingTokenBalance = getLiquidityValue(
          underlying.underlyingTokenSupply,
          underlying.lpTotalSupply,
          rawData[underlying.lpSymbol].totalLpTokenBalance,
        );

        rawData[underlying.lpSymbol].totalUnderlyingQuoteTokenBalance = getLiquidityValue(
          underlying.underlyingQuoteTokenSupply,
          underlying.lpTotalSupply,
          rawData[underlying.lpSymbol].totalLpTokenBalance,
        );
      }
    });

    return rawData;
  },
};
