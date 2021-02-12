import BigNumber from 'bignumber.js';
import { ERC20 } from '../abi/ERC20';
import { MasterChef } from '../abi/MasterChef';
import farmsConfig from './constants/farms';
import addresses from './constants/contracts';
import multicall from './multicall';

export const getAddress = (address) => {
  const mainNetChainId = 56;
  return address[mainNetChainId];
};

const getMasterChefAddress = () => getAddress(addresses.masterChef);
const getFullDisplayBalance = (balance, decimals) => balance.dividedBy(new BigNumber(10).pow(decimals)).toFixed();

export const fetchFarmUserTokenBalances = async (account) => {
  const calls = farmsConfig.map((farm) => {
    const lpContractAddress = getAddress(farm.lpAddresses);
    return {
      address: lpContractAddress,
      name: 'balanceOf',
      params: [account],
    };
  });

  const rawTokenBalances = await multicall(ERC20, calls);
  const parsedTokenBalances = rawTokenBalances.map((tokenBalance) => new BigNumber(tokenBalance).toJSON());
  return parsedTokenBalances;
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
    address: getAddress(farm.tokenAddresses),
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

export const fetchFarmUserEarnings = async (account) => {
  const masterChefAdress = getMasterChefAddress();

  const calls = farmsConfig.map((farm) => ({
    address: masterChefAdress,
    name: 'pendingCake',
    params: [farm.pid, account],
  }));

  const rawEarnings = await multicall(MasterChef, calls);
  const parsedEarnings = rawEarnings.map((earnings) => new BigNumber(earnings).toJSON());
  return parsedEarnings;
};
