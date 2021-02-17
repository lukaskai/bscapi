import pancakeSwapFetcher from '../protocols/pancakeSwap/fetcher';
import pancakeSwapMapper from '../protocols/pancakeSwap/mapper';
import autoFarmFetcher from '../protocols/autoFarm/fetcher';
import autoFarmMapper from '../protocols/autoFarm/mapper';
import beefyFetcher from '../protocols/beefy/fetcher';
import beefyMapper from '../protocols/beefy/mapper';
import sharedMapper from '../protocols/shared/mapper';
import sharedFetcher from '../protocols/shared/fetcher';
import venusFetcher from '../protocols/venus/fetcher';
import venusMapper from '../protocols/venus/mapper';
import apeSwapFetcher from '../protocols/apeSwap/fetcher';
import apeSwapMapper from '../protocols/apeSwap/mapper';

export default {
  async getAssets(address) {
    const [pancakeSwapRawData,
      autoFarmRawData,
      beefyRawData,
      venusRawData,
      apeSwapRawData] = await Promise.all([
      pancakeSwap(address),
      autoFarm(address),
      beefy(address),
      venusFetcher.fetchUserBalances(address),
      apeSwap(address),
    ]);

    const underlyingPancakeSwap = sharedMapper.mapRawToUnderlying(pancakeSwapRawData);
    const underlyingApeSwap = sharedMapper.mapRawToUnderlying(apeSwapRawData);
    const underlyingAutoFarm = sharedMapper.mapRawToUnderlying(autoFarmRawData);
    const underlyingBeefy = sharedMapper.mapRawToUnderlying(beefyRawData);
    const underlyingVenus = await venusMapper.mapRawToUnderlying(venusRawData);
    const debtVenus = await venusMapper.mapRawToDebt(venusRawData);


    return {
      asset: {
        PancakeSwap: {
          underlying: underlyingPancakeSwap,
          rawData: pancakeSwapRawData,
        },
        AutoFarm: {
          underlying: underlyingAutoFarm,
          rawData: autoFarmRawData,
        },
        Beefy: {
          underlying: underlyingBeefy,
          rawData: beefyRawData,
        },
        Venus: {
          underlying: underlyingVenus,
          debt: debtVenus,
          rawData: venusRawData,
        },
        ApeSwap: {
          underlying: underlyingApeSwap,
          rawData: apeSwapRawData,
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
  const enrichedLpTokens = await sharedFetcher.fetchLpTokens(stakedLpTokens);
  const enrichedLpUnderlyingTokens = await sharedFetcher.fetchUnderlyingLpTokens(enrichedLpTokens);

  const rawData = autoFarmMapper.mapToRawData(stakedSimpleTokens, enrichedLpUnderlyingTokens);

  return rawData;
}

async function beefy(address) {
  const { stakedSimpleTokens, stakedLpTokens } = await beefyFetcher.fetchFarmUserStakedBalances(address);
  const enrichedLpTokens = await sharedFetcher.fetchLpTokens(stakedLpTokens);
  const enrichedLpUnderlyingTokens = await sharedFetcher.fetchUnderlyingLpTokens(enrichedLpTokens);
  const rawData = beefyMapper.mapToRawData(stakedSimpleTokens, enrichedLpUnderlyingTokens);

  return rawData;
}

async function apeSwap(address) {
  const [lpTokensUnderlying,
    userLpTokenBalances,
    userStakedBalances] = await Promise.all([
    apeSwapFetcher.fetchPools(),
    apeSwapFetcher.fetchLpTokenBalances(address),
    apeSwapFetcher.fetchFarmUserStakedBalances(address)]);

  const rawData = apeSwapMapper.mapToRawData(lpTokensUnderlying,
    userLpTokenBalances,
    userStakedBalances);


  return rawData;
}
