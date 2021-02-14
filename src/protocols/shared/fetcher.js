import BigNumber from 'bignumber.js';
import { ERC20 } from '../abi/ERC20';
import { ERC20LP } from '../abi/ERC20LP';
import { MasterChefAutoFarm } from '../abi/MasterChefAutoFarm';
import multicall from './multicall';


export default {
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
