import BigNumber from 'bignumber.js';
import { ERC20 } from '../abi/ERC20';
import { MasterChef } from '../abi/MasterChef';
import multicall from './multicall';
import { getFullDisplayBalance, getAddress } from './helpers';

export default {
  fetchLpTokenBalances: async (lpTokens, account) => {
    const calls = lpTokens.map((lpToken) => {
      const lpContractAddress = getAddress(lpToken.lpAddresses);
      return {
        address: lpContractAddress,
        name: 'balanceOf',
        params: [account],
      };
    });

    const rawTokenBalances = await multicall(ERC20, calls);
    const parsedLpTokenBalances = rawTokenBalances.map((tokenBalance) => (new BigNumber(tokenBalance)));
    return parsedLpTokenBalances;
  },

  fetchFarmUserStakedBalances: async (masterChefAddress, farmsConfig, account) => {
    const calls = farmsConfig.map((farm) => ({
      address: masterChefAddress,
      name: 'userInfo',
      params: [farm.pid, account],
    }));

    const rawStakedBalances = await multicall(MasterChef, calls);

    const parsedStakedBalances = rawStakedBalances
      .map((stakedTokenBalance) => (new BigNumber(stakedTokenBalance[0]._hex)));
    return parsedStakedBalances;
  },

  fetchLpTokenMetadata: async (lpTokens) => {
    const data = await Promise.all(
      lpTokens.map(async (lpToken) => {
        const lpAddress = getAddress(lpToken.lpAddresses);
        const calls = [
          // Balance of token in the LP contract
          {
            address: getAddress(lpToken.tokenAddresses),
            name: 'balanceOf',
            params: [lpAddress],
          },
          // Balance of quote token on LP contract
          {
            address: getAddress(lpToken.quoteTokenAdresses),
            name: 'balanceOf',
            params: [lpAddress],
          },
          // Total supply of LP tokens
          {
            address: lpAddress,
            name: 'totalSupply',
          },
          // Token decimals
          {
            address: getAddress(lpToken.tokenAddresses),
            name: 'decimals',
          },
          // Quote token decimals
          {
            address: getAddress(lpToken.quoteTokenAdresses),
            name: 'decimals',
          },
          // Lp token decimals
          {
            address: lpAddress,
            name: 'decimals',
          },
        ];

        const [
          tokenBalanceLP,
          quoteTokenBlanceLP,
          lpTotalSupply,
          tokenDecimals,
          quoteTokenDecimals,
          lpTokenDecimals,
        ] = await multicall(ERC20, calls);

        return {
          ...lpToken,
          underlyingTokenSupply: getFullDisplayBalance(new BigNumber(tokenBalanceLP), tokenDecimals),
          underlyingQuoteTokenSupply: getFullDisplayBalance(new BigNumber(quoteTokenBlanceLP), quoteTokenDecimals),
          lpTotalSupply: getFullDisplayBalance(new BigNumber(lpTotalSupply), lpTokenDecimals),
          lpTokenDecimals,
        };
      }),
    );
    return data;
  },
};
