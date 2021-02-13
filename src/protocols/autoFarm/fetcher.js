import BigNumber from 'bignumber.js';
import { ERC20 } from '../abi/ERC20';
import { ERC20LP } from '../abi/ERC20LP';
import { MasterChefAutoFarm } from '../abi/MasterChefAutoFarm';
import farmsConfig from './constants/farms';
import multicall from './multicall';
import { getAddress, getFullDisplayBalance, getMasterChefAddress } from './helpers';

const poolLength = 65;

const getFarmData = async () => {
  const masterChefAdress = getMasterChefAddress();
  const pancakeSwapFarms = [];

  Object.keys(farmsConfig.pools).forEach((dataKey) => {
    const farm = farmsConfig.pools[dataKey];
    if (farm.farmPid && pancakeSwapFarms.indexOf(farm.farmPid) === -1) pancakeSwapFarms.push(farm.farmPid);
  });

  const calls = [];
  for (let i = 1; i < poolLength; i += 1) {
    calls.push({
      address: masterChefAdress,
      name: 'poolInfo',
      params: [i],
    });
  }

  const callsResponse = await multicall(MasterChefAutoFarm, calls);
  const poolTokenAddresses = {};

  for (let i = 1; i < poolLength; i += 1) {
    // eslint-disable-next-line prefer-destructuring
    poolTokenAddresses[i] = callsResponse[i - 1][0];
  }

  return poolTokenAddresses;
};

export const fetchFarmUserStakedBalances = async (account) => {
  const masterChefAdress = getMasterChefAddress();
  const poolTokenAddresses = await getFarmData();

  const calls = [];

  Object.keys(poolTokenAddresses).forEach((pid) => {
    calls.push({
      address: masterChefAdress,
      name: 'stakedWantTokens',
      params: [pid, account],
    });
  });

  const rawStakedBalances = await multicall(MasterChefAutoFarm, calls);
  const toReturn = [];

  Object.keys(poolTokenAddresses).forEach((pid) => {
    const address = poolTokenAddresses[pid];
    toReturn.push({
      pid,
      rawStakedBalance: (new BigNumber(rawStakedBalances[pid - 1][0]._hex)),
      tokenAddress: address,
    });
  });

  return toReturn;
};

export const fetchTokens = async (balanceData) => {
  const data = await Promise.all(
    balanceData.map(async (b) => {
      const calls = [
        // Symbol
        {
          address: b.tokenAddress,
          name: 'symbol',
        },
        // Decimals
        {
          address: b.tokenAddress,
          name: 'decimals',
        },
      ];

      const [
        symbol,
        decimals,
      ] = await multicall(ERC20, calls);

      return {
        ...b,
        symbol: symbol[0],
        decimals: decimals[0],
      };
    }),
  );
  return data;
};

export const fetchLpTokens = async (lpBalanceData) => {
  const data = await Promise.all(
    lpBalanceData.map(async (b) => {
      const calls = [
        // Token
        {
          address: b.tokenAddress,
          name: 'token0',
        },
        // QuoteToken
        {
          address: b.tokenAddress,
          name: 'token1',
        },
        // Total supply of LP
        {
          address: b.tokenAddress,
          name: 'totalSupply',
        },
      ];

      const [
        token,
        quoteToken,
        lpTotalSupply,
      ] = await multicall(ERC20LP, calls);

      return {
        ...b,
        baseTokenAddress: token[0],
        quoteTokenAddress: quoteToken[0],
        lpTotalSupply: (new BigNumber(lpTotalSupply[0]._hex)),
      };
    }),
  );
  return data;
};

export const fetchUnderlyingLpTokens = async (lpBalanceData) => {
  const data = await Promise.all(
    lpBalanceData.map(async (b) => {
      const calls = [
        // Base Token Symbol
        {
          address: b.baseTokenAddress,
          name: 'symbol',
        },
        // Base Token Decimals
        {
          address: b.baseTokenAddress,
          name: 'decimals',
        },
        // Base Token Total balance
        {
          address: b.baseTokenAddress,
          name: 'balanceOf',
          params: [b.tokenAddress],
        },
        // Quote Token Symbol
        {
          address: b.quoteTokenAddress,
          name: 'symbol',
        },
        // Quote Token Decimals
        {
          address: b.quoteTokenAddress,
          name: 'decimals',
        },
        // Quote Token Total balance
        {
          address: b.quoteTokenAddress,
          name: 'balanceOf',
          params: [b.tokenAddress],
        },
      ];

      const [
        baseTokenSymbol,
        baseTokenDecimals,
        baseTokenLpBalance,
        quoteTokenSymbol,
        quoteTokenDecimals,
        quoteTokenLpBalance,
      ] = await multicall(ERC20, calls);

      return {
        ...b,
        baseTokenSymbol: baseTokenSymbol[0],
        baseTokenDecimals: baseTokenDecimals[0],
        baseTokenLpBalance: (new BigNumber(baseTokenLpBalance[0]._hex)),
        quoteTokenSymbol: quoteTokenSymbol[0],
        quoteTokenDecimals: quoteTokenDecimals[0],
        quoteTokenLpBalance: (new BigNumber(quoteTokenLpBalance[0]._hex)),
      };
    }),
  );
  return data;
};

export const a = () => {};
