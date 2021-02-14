import BigNumber from 'bignumber.js';
import { ERC20 } from '../abi/ERC20';
import { BeefyVault } from '../abi/BeefyVault';
import multicall from '../shared/multicall';
import { getFullDisplayBalance } from '../shared/helpers';
import { pools } from './constants/pools';

const tokensList = [];
const LP_TOKEN_SYMBOL = 'LP';
const poolsLatest = pools;

(function loadTokens() {
  const tokensFromPools = {};

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

  Object.keys(tokensFromPools).forEach((key) => {
    if (tokensFromPools[key].tokenAddress) {
      tokensList.push({
        token: key,
        tokenAddress: tokensFromPools[key].tokenAddress,
        tokenBalance: tokensFromPools[key].tokenBalance,
      });
    }
  });
}());


async function fetchBalances(account) {
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

  return newTokens;
}

async function updatePoolPricePerShare() {
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
}

export default {
  fetchFarmUserStakedBalances: async (account) => {
    await updatePoolPricePerShare();

    const stakedBalances = [];
    const tokens = await fetchBalances(account);

    poolsLatest.map((pool) => {
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
