import {
  fetchLpTokenBalances,
  fetchFarmUserStakedBalances, fetchPools,
} from '../protocols/pancakeSwap/fetcher';
import pancakeSwapMapper from '../protocols/pancakeSwap/mapper';
import {
  fetchFarmUserStakedBalances as fetchFarmUserStakedBalancesAutoFarm, fetchLpTokens,
  fetchTokens, fetchUnderlyingLpTokens,
} from '../protocols/autoFarm/fetcher';
import autoFarmMapper from '../protocols/autoFarm/mapper';

export default {
  async getAssets(address) {
    // PANCAKE SWAP
    // const pancakeSwapRawData = await pancakeSwap(address);
    // const underlyingPancakeSwap = pancakeSwapMapper.mapRawToUnderlying(pancakeSwapRawData);

    // AUTOFARM
    const rawStakedBalances = await fetchFarmUserStakedBalancesAutoFarm(address);
    const enrichedBalanceData = await fetchTokens(rawStakedBalances);
    const stakedSimpleTokens = enrichedBalanceData.filter((e) => e.symbol !== 'Cake-LP');
    const stakedLpTokens = enrichedBalanceData.filter((e) => e.symbol === 'Cake-LP');
    const enrichedLpTokens = await fetchLpTokens(stakedLpTokens);
    const enrichedLpUnderlyingTokens = await fetchUnderlyingLpTokens(enrichedLpTokens);
    const autoFarmRawData = autoFarmMapper.mapToRawData(stakedSimpleTokens, enrichedLpUnderlyingTokens);
    const autoFarmUnderlying = autoFarmMapper.mapRawToUnderlying(autoFarmRawData);

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

  const rawData = pancakeSwapMapper.mapToRawData(lpTokensUnderlying,
    userLpTokenBalances,
    userStakedBalances);


  return rawData;
}
