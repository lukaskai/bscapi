import BigNumber from 'bignumber.js';
import { ERC20 } from '../abi/ERC20';
import { MasterChef } from '../abi/MasterChef';
import farmsConfig from './constants/farms';
import addresses from './constants/contracts';
import multicall from './multicall';

const displayDecimals = 5;

export const getAddress = (address) => {
  const mainNetChainId = 56;
  return address[mainNetChainId];
};

const getMasterChefAddress = () => getAddress(addresses.masterChef);
const getFullDisplayBalance = (balance, decimals) => Number(balance.dividedBy(new BigNumber(10)
  .pow(decimals)).toFixed(displayDecimals));

export const fetchLpTokenBalances = async (account) => {
  const calls = farmsConfig.map((farm) => {
    const lpContractAddress = getAddress(farm.lpAddresses);
    return {
      address: lpContractAddress,
      name: 'balanceOf',
      params: [account],
    };
  });

  const callsTokens = farmsConfig.map((farm) => ({
    address: getAddress(farm.lpAddresses),
    name: 'decimals',
  }));

  const tokenDecimals = await multicall(ERC20, callsTokens);

  const rawTokenBalances = await multicall(ERC20, calls);
  const parsedLpTokenBalances = rawTokenBalances.map((tokenBalance, index) => ({
    balanceRaw: new BigNumber(tokenBalance).toJSON(),
    decimals: tokenDecimals[index][0],
    displayBalance: getFullDisplayBalance(new BigNumber(tokenBalance), tokenDecimals[index][0]),
  }));

  return parsedLpTokenBalances;
};

export const fetchFarmUserStakedBalances = async (account) => {
  const masterChefAdress = getMasterChefAddress();

  const calls = farmsConfig.map((farm) => ({
    address: masterChefAdress,
    name: 'userInfo',
    params: [farm.pid, account],
  }));

  const rawStakedBalances = await multicall(MasterChef, calls);

  const callsTokens = farmsConfig.map((farm) => ({
    address: getAddress(farm.lpAddresses),
    name: 'decimals',
  }));

  const tokenDecimals = await multicall(ERC20, callsTokens);

  const parsedStakedBalances = rawStakedBalances.map((stakedBalance, index) => ({
    stakedRaw: new BigNumber(stakedBalance[0]._hex).toJSON(),
    decimals: tokenDecimals[index][0],
    displayBalance: getFullDisplayBalance(new BigNumber(stakedBalance[0]._hex), tokenDecimals[index][0]),
  }));
  return parsedStakedBalances;
};

// export const fetchFarmUserEarnings = async (account) => {
//   const masterChefAdress = getMasterChefAddress();
//
//   const calls = farmsConfig.map((farm) => ({
//     address: masterChefAdress,
//     name: 'pendingCake',
//     params: [farm.pid, account],
//   }));
//
//   const callsTokens = farmsConfig.map((farm) => ({
//     address: getAddress(farm.tokenAddresses),
//     name: 'decimals',
//   }));
//
//   const tokenDecimals = await multicall(ERC20, callsTokens);
//
//   const rawEarnings = await multicall(MasterChef, calls);
//   const parsedEarnings = rawEarnings.map((rawEarning, index) => ({
//     earningsRaw: new BigNumber(rawEarning).toJSON(),
//     decimals: tokenDecimals[index][0],
//     displayBalance: getFullDisplayBalance(new BigNumber(rawEarning), tokenDecimals[index][0]),
//   }));
//   return parsedEarnings;
// };


export const fetchFarms = async () => {
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
        // Balance of LP tokens in the master chef contract
        {
          address: lpAdress,
          name: 'balanceOf',
          params: [getMasterChefAddress()],
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
        lpTokenBalanceMC,
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
      };
    }),
  );
  return data;
};
