import farmsConfig from './constants/farms';
import swapMapper from '../shared/swapMapper';

export default {
  mapToRawData: (lpTokensUnderlying,
    userLpTokenBalances,
    userStakedBalances) => swapMapper.mapToRawData(farmsConfig, lpTokensUnderlying,
    userLpTokenBalances,
    userStakedBalances),
};
