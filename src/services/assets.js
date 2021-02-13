import {
  fetchLpTokenBalances,
  fetchFarmUserStakedBalances, fetchPools,
} from '../protocols/pancakeSwap/fetcher';
import { mapRawToUnderlying, mapToRawData } from '../protocols/pancakeSwap/mapper';

export default {
  async getAssets(address) {
    // PANCAKE SWAP
    const pancakeSwapRawData = await pancakeSwap(address);
    const underlyingPancakeSwap = mapRawToUnderlying(pancakeSwapRawData);

    return {
      asset: {
        PancakeSwap: {
          underlying: underlyingPancakeSwap,
          rawData: pancakeSwapRawData,
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
