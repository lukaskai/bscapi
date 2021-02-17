import BigNumber from 'bignumber.js';
import { ERC20 } from '../abi/ERC20';
import { MasterChef } from '../abi/MasterChef';
import multicall from './multicall';
import { getFullDisplayBalance, getAddress } from './helpers';

export default {
  fetchLpTokenBalances: async (farmsConfig, account) => {
    const calls = farmsConfig.map((farm) => {
      const lpContractAddress = getAddress(farm.lpAddresses);
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

  fetchPools: async (farmsConfig) => {
    const data = await Promise.all(
      farmsConfig.map(async (farmConfig) => {
        const lpAdress = getAddress(farmConfig.lpAddresses);
        const calls = [
          // Balance of token in the LP contract
          {
            address: getAddress(farmConfig.tokenAddresses),
            name: 'balanceOf',
            params: [lpAdress],
          },
          // Balance of quote token on LP contract
          {
            address: getAddress(farmConfig.quoteTokenAdresses),
            name: 'balanceOf',
            params: [lpAdress],
          },
          // Total supply of LP tokens
          {
            address: lpAdress,
            name: 'totalSupply',
          },
          // Token decimals
          {
            address: getAddress(farmConfig.tokenAddresses),
            name: 'decimals',
          },
          // Quote token decimals
          {
            address: getAddress(farmConfig.quoteTokenAdresses),
            name: 'decimals',
          },
          // Lp token decimals
          {
            address: lpAdress,
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
          ...farmConfig,
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
