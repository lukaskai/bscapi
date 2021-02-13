import {
  fetchLpTokenBalances,
  fetchFarmUserStakedBalances, fetchPools,
} from '../protocols/pancakeSwap/fetcher';
import { mapRawToUnderlying, mapToRawData } from '../protocols/pancakeSwap/mapper';
import {
  fetchFarmUserStakedBalances as fetchFarmUserStakedBalancesAutoFarm, fetchLpTokens,
  fetchTokens, fetchUnderlyingLpTokens,
} from '../protocols/autoFarm/fetcher';
import farmsConfig from '../protocols/pancakeSwap/constants/farms';
import { getAddress } from '../protocols/pancakeSwap/helpers';
import { mapRawToUnderlyingA, mapToRawDataA } from '../protocols/autoFarm/mapper';

export default {
  async getAssets(address) {
    // PANCAKE SWAP
    // const pancakeSwapRawData = await pancakeSwap(address);
    // const underlyingPancakeSwap = mapRawToUnderlying(pancakeSwapRawData);

    // AUTOFARM
    const rawStakedBalances = await fetchFarmUserStakedBalancesAutoFarm(address);
    // console.log(rawStakedBalances);
    const enrichedBalanceData = await fetchTokens(rawStakedBalances);
    const stakedSimpleTokens = enrichedBalanceData.filter((e) => e.symbol !== 'Cake-LP');
    const stakedLpTokens = enrichedBalanceData.filter((e) => e.symbol === 'Cake-LP');
    const enrichedLpTokens = await fetchLpTokens(stakedLpTokens);
    const enrichedLpUnderlyingTokens = await fetchUnderlyingLpTokens(enrichedLpTokens);
    const autoFarmRawData = mapToRawDataA(stakedSimpleTokens, enrichedLpUnderlyingTokens);
    const autoFarmUnderlying = mapRawToUnderlyingA(autoFarmRawData);

    return {
      asset: {
        // PancakeSwap: {
        //   underlying: underlyingPancakeSwap,
        //   rawData: pancakeSwapRawData,
        // },
        AutoFarm: {
          underlying: autoFarmUnderlying,
          rawData: autoFarmRawData,
        },
      },
      walletId: address,
    };
  },
};

async function pancakeSwap(address) {
  const [lpTokensUnderlying,
    userLpTokenBalances,
    userStakedBalances] = await Promise.all([
    fetchPools(),
    fetchLpTokenBalances(address),
    fetchFarmUserStakedBalances(address)]);

  const rawData = mapToRawData(lpTokensUnderlying,
    userLpTokenBalances,
    userStakedBalances);


  return rawData;
}
