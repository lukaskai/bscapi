import BigNumber from 'bignumber.js';
import { ERC20 } from '../abi/ERC20';
import { Venus } from '../abi/Venus';
import { markets } from './constants/markets';
import multicall from '../shared/multicall';
import config from '../../config';

const latestMarkets = markets;

async function fetchTokenMetadata() {
  await Promise.all(
    latestMarkets.map(async (m, i) => {
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

        // eslint-disable-next-line prefer-destructuring
        latestMarkets[i].underlyingDecimals = decimals[0];
      } else {
        // eslint-disable-next-line prefer-destructuring
        latestMarkets[i].underlyingDecimals = 18;
      }
    }),
  );
}


export default {
  fetchUserUnderlying: async (account) => {
    await fetchTokenMetadata();
    const calls = [];

    latestMarkets.forEach((m) => {
      calls.push({
        address: m.address,
        name: 'exchangeRateCurrent',
      });
    });

    const exchangeRates = await multicall(Venus, calls);

    latestMarkets.forEach((m, i) => {
      const exchangeRate = (new BigNumber(exchangeRates[i][0]._hex));
      const mantissa = 18 + m.underlyingDecimals - 8;
      const oneVTokenInUnderlying = exchangeRate.div(10 ** mantissa);
      m.exchangeRate = oneVTokenInUnderlying.toString();
    });

    const vBalancesCalls = [];

    latestMarkets.forEach((m) => {
      vBalancesCalls.push({
        address: m.address,
        name: 'balanceOf',
        params: [account],
      });
    });

    const vBalances = await multicall(Venus, vBalancesCalls);

    latestMarkets.forEach((m, i) => {
      m.vBalance = Number(new BigNumber(vBalances[i][0]._hex).div(10 ** 8).toFixed(config.math.DECIMALS_FOR_DISPLAY));
      m.balanceUnderlying = Number(new BigNumber(vBalances[i][0]._hex).div(10 ** 8)
        .multipliedBy(m.exchangeRate).toFixed(config.math.DECIMALS_FOR_DISPLAY));
    });


    const vDebtCalls = [];

    latestMarkets.forEach((m) => {
      vDebtCalls.push({
        address: m.address,
        name: 'borrowBalanceCurrent',
        params: [account],
      });
    });

    const vDebt = await multicall(Venus, vDebtCalls);

    latestMarkets.forEach((m, i) => {
      m.debtBalance = Number(new BigNumber(vDebt[i][0]._hex)
        .div(10 ** m.underlyingDecimals).toFixed(config.math.DECIMALS_FOR_DISPLAY));
    });

    const latestMarketsFiltered = latestMarkets.filter((l) => l.balanceUnderlying > 0 || l.debtBalance > 0);

    return latestMarketsFiltered;
  },
};
