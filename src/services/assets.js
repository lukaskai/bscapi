import pancakeSwapFetcher from '../protocols/pancakeSwap/fetcher';
import pancakeSwapMapper from '../protocols/pancakeSwap/mapper';
import autoFarmFetcher from '../protocols/autoFarm/fetcher';
import autoFarmMapper from '../protocols/autoFarm/mapper';
import beefyFetcher from '../protocols/beefy/fetcher';
import beefyMapper from '../protocols/beefy/mapper';

export default {
  async getAssets(address) {
    // PANCAKE SWAP
    // const pancakeSwapRawData = await pancakeSwap(address);
    // const underlyingPancakeSwap = pancakeSwapMapper.mapRawToUnderlying(pancakeSwapRawData);
    //
    // // AUTOFARM
    // const autoFarmRawData = await autoFarm(address);
    // const underlyingAutoFarm = pancakeSwapMapper.mapRawToUnderlying(autoFarmRawData);

    // BEEFY FINANCE
    const { stakedSimpleTokens, stakedLpTokens } = await beefyFetcher.fetchFarmUserStakedBalances(address);
    const enrichedLpTokens = await autoFarmFetcher.fetchLpTokens(stakedLpTokens);
    const enrichedLpUnderlyingTokens = await autoFarmFetcher.fetchUnderlyingLpTokens(enrichedLpTokens);
    const beefyRawData = beefyMapper.mapToRawData(stakedSimpleTokens, enrichedLpUnderlyingTokens);
    const underlyingBeefy = beefyMapper.mapRawToUnderlying(beefyRawData);


    return {
      asset: {
        // PancakeSwap: {
        //   underlying: underlyingPancakeSwap,
        //   rawData: pancakeSwapRawData,
        // },
        // AutoFarm: {
        //   underlying: underlyingAutoFarm,
        //   rawData: autoFarmRawData,
        // },
        Beefy: {
          underlying: underlyingBeefy,
          rawData: beefyRawData,
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
    pancakeSwapFetcher.fetchPools(),
    pancakeSwapFetcher.fetchLpTokenBalances(address),
    pancakeSwapFetcher.fetchFarmUserStakedBalances(address)]);

  const rawData = pancakeSwapMapper.mapToRawData(lpTokensUnderlying,
    userLpTokenBalances,
    userStakedBalances);


  return rawData;
}

async function autoFarm(address) {
  const rawStakedBalances = await autoFarmFetcher.fetchFarmUserStakedBalances(address);
  const { stakedLpTokens, stakedSimpleTokens } = await autoFarmFetcher.fetchTokenMetadata(rawStakedBalances);
  const enrichedLpTokens = await autoFarmFetcher.fetchLpTokens(stakedLpTokens);
  const enrichedLpUnderlyingTokens = await autoFarmFetcher.fetchUnderlyingLpTokens(enrichedLpTokens);

  const rawData = autoFarmMapper.mapToRawData(stakedSimpleTokens, enrichedLpUnderlyingTokens);

  return rawData;
}
