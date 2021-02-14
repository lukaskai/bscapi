import BigNumber from 'bignumber.js';
import Web3 from 'web3';
import { ERC20 } from '../abi/ERC20';
import { BeefyVault } from '../abi/BeefyVault';
import { MasterChefAutoFarm } from '../abi/MasterChefAutoFarm';
import multicall from '../shared/multicall';
import { getFullDisplayBalance } from '../shared/helpers';
import { pools } from './pools';
import config from '../../config';

const tokensFromPools = {};
const LP_TOKEN_SYMBOL = 'LP';
const poolsLatest = pools;
const web3 = new Web3(new Web3.providers.HttpProvider(config.web3.HTTP_PROVIDER));

function setTokens() {
  poolsLatest.forEach(({
    token, tokenAddress, earnedToken, earnedTokenAddress,
  }) => {
    tokensFromPools[token] = {
      tokenAddress,
      tokenBalance: 0,
    };
    tokensFromPools[earnedToken] = {
      tokenAddress: earnedTokenAddress,
      tokenBalance: 0,
    };
  });
}

setTokens();


async function fetchBalances(account) {
  const tokensList = [];
  Object.keys(tokensFromPools).forEach((key) => {
    if (tokensFromPools[key].tokenAddress) {
      tokensList.push({
        token: key,
        tokenAddress: tokensFromPools[key].tokenAddress,
        tokenBalance: tokensFromPools[key].tokenBalance,
      });
    }
  });

  const calls = [];

  tokensList.forEach((token) => {
    calls.push({
      address: token.tokenAddress,
      name: 'balanceOf',
      params: [account],
    });
  });

  const response = await multicall(ERC20, calls);
  const newTokens = [];

  tokensList.forEach((token, i) => {
    if (token.tokenAddress) {
      newTokens[token.token] = {
        tokenAddress: token.tokenAddress,
        tokenBalance: new BigNumber(response[i][0]._hex),
      };
    }
  });

  const poolCalls = [];

  poolsLatest.forEach((pool) => {
    poolCalls.push({
      address: pool.earnedTokenAddress,
      name: 'getPricePerFullShare',
    });
  });

  const responsePools = await multicall(BeefyVault, poolCalls);
  poolsLatest.forEach((pool, i) => {
    pool.pricePerFullShare = getFullDisplayBalance(new BigNumber(responsePools[i][0]._hex), pool.tokenDecimals);
  });
  return newTokens;
}

export default {
  fetchFarmUserStakedBalances: async (account) => {
    const stakedBalances = [];
    const tokens = await fetchBalances(account);
    poolsLatest.map((pool, index) => {
      const sharesBalance = new BigNumber(tokens[pool.earnedToken].tokenBalance);
      const rawStakedBalance = getFullDisplayBalance(
        sharesBalance.multipliedBy(new BigNumber(pool.pricePerFullShare)), pool.tokenDecimals,
      );
      if (rawStakedBalance > 0) {
        stakedBalances.push({
          ...pool,
          sharesBalance: sharesBalance.toNumber(),
          dec: pool.tokenDecimals,
          price: pool.pricePerFullShare,
          rawStakedBalance,
        });
      }
    });
    return {
      stakedSimpleTokens: stakedBalances.filter((e) => !e.token.includes(LP_TOKEN_SYMBOL)),
      stakedLpTokens: stakedBalances.filter((e) => e.token.includes(LP_TOKEN_SYMBOL)),
    };
  },
};
