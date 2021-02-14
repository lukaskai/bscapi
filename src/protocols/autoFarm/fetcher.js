import BigNumber from 'bignumber.js';
import { ERC20 } from '../abi/ERC20';
import { ERC20LP } from '../abi/ERC20LP';
import { MasterChefAutoFarm } from '../abi/MasterChefAutoFarm';
import multicall from '../shared/multicall';

const MASTERCHEF_ADDRESS = '0x0895196562c7868c5be92459fae7f877ed450452';
const POOL_LENGTH = 65;
const LP_TOKEN_SYMBOL = 'Cake-LP';

const getFarmData = async () => {
  const calls = [];
  for (let i = 1; i < POOL_LENGTH; i += 1) {
    calls.push({
      address: MASTERCHEF_ADDRESS,
      name: 'poolInfo',
      params: [i],
    });
  }

  const callsResponse = await multicall(MasterChefAutoFarm, calls);
  const poolTokenAddresses = {};

  for (let i = 1; i < POOL_LENGTH; i += 1) {
    // eslint-disable-next-line prefer-destructuring
    poolTokenAddresses[i] = callsResponse[i - 1][0];
  }

  return poolTokenAddresses;
};

export default {
  fetchFarmUserStakedBalances: async (account) => {
    const poolTokenAddresses = await getFarmData();

    const calls = [];

    Object.keys(poolTokenAddresses).forEach((pid) => {
      calls.push({
        address: MASTERCHEF_ADDRESS,
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
  },
  fetchTokenMetadata: async (balanceData) => {
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

    return {
      stakedSimpleTokens: data.filter((e) => e.symbol !== LP_TOKEN_SYMBOL),
      stakedLpTokens: data.filter((e) => e.symbol === LP_TOKEN_SYMBOL),
    };
  },
  fetchLpTokens: async (lpBalanceData) => {
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
  },
  fetchUnderlyingLpTokens: async (lpBalanceData) => {
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
  },
};
