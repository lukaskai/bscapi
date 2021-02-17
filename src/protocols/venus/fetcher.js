import BigNumber from 'bignumber.js';
import { ERC20 } from '../abi/ERC20';
import { Venus } from '../abi/Venus';
import { markets } from './constants/markets';
import multicall from '../shared/multicall';
import config from '../../config';

const DEFAULT_DECIMALS = config.math.DECIMALS_DEFAULT;
const V_TOKEN_DECIMALS = 8;

async function fetchTokenMetadataAndRate() {
  const latestMarketData = markets.map((m) => ({
    ...m,
  }));

  await Promise.all(
    latestMarketData.map(async (m, i) => {
      if (m.underlyingAddress) {
        const calls = [
          // Decimals
          {
            address: m.underlyingAddress,
            name: 'decimals',
          },
        ];

        const [
          decimals,
        ] = await multicall(ERC20, calls);

        latestMarketData[i].underlyingDecimals = decimals[0];
      } else {
        latestMarketData[i].underlyingDecimals = DEFAULT_DECIMALS;
      }
    }),
  );

  const calls = [];

  latestMarketData.forEach((m) => {
    calls.push({
      address: m.address,
      name: 'exchangeRateCurrent',
    });
  });

  const exchangeRates = await multicall(Venus, calls);

  latestMarketData.forEach((m, i) => {
    const exchangeRate = (new BigNumber(exchangeRates[i][0]._hex));
    const mantissa = DEFAULT_DECIMALS + m.underlyingDecimals - V_TOKEN_DECIMALS;
    const oneVTokenInUnderlying = exchangeRate.div(10 ** mantissa);
    m.exchangeRate = oneVTokenInUnderlying.toString();
  });

  return latestMarketData;
}


export default {
  fetchUserBalances: async (account) => {
    const marketsData = await fetchTokenMetadataAndRate();

    const vBalancesCalls = [];

    marketsData.forEach((m) => {
      vBalancesCalls.push({
        address: m.address,
        name: 'balanceOf',
        params: [account],
      });
    });

    const vBalances = await multicall(Venus, vBalancesCalls);

    marketsData.forEach((m, i) => {
      m.vBalance = Number(new BigNumber(vBalances[i][0]._hex)
        .div(10 ** V_TOKEN_DECIMALS).toFixed(config.math.DECIMALS_FOR_DISPLAY));
      m.balanceUnderlying = Number(new BigNumber(vBalances[i][0]._hex).div(10 ** V_TOKEN_DECIMALS)
        .multipliedBy(m.exchangeRate).toFixed(config.math.DECIMALS_FOR_DISPLAY));
    });


    const vDebtCalls = [];

    marketsData.forEach((m) => {
      vDebtCalls.push({
        address: m.address,
        name: 'borrowBalanceCurrent',
        params: [account],
      });
    });

    const vDebt = await multicall(Venus, vDebtCalls);

    marketsData.forEach((m, i) => {
      m.debtBalance = Number(new BigNumber(vDebt[i][0]._hex)
        .div(10 ** m.underlyingDecimals).toFixed(config.math.DECIMALS_FOR_DISPLAY));
    });

    const marketsFiltered = marketsData.filter((l) => l.balanceUnderlying > 0 || l.debtBalance > 0);

    return marketsFiltered;
  },
};
