import farmsConfig from './constants/farms';
import swapMapper from '../shared/swapMapper';

export default {
  mapToRawData: (lpTokensMetadata,
    lpTokensBalances,
    stakedLpTokensBalances) => swapMapper.mapToRawData(farmsConfig, lpTokensMetadata,
    lpTokensBalances,
    stakedLpTokensBalances),
};
