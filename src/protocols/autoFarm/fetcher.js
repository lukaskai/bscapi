import BigNumber from 'bignumber.js';
import { ERC20 } from '../abi/ERC20';
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
};
