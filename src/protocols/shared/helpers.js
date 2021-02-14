import BigNumber from 'bignumber.js';
import config from '../../config';
import addresses from '../pancakeSwap/constants/contracts';

export const getFullDisplayBalance = (balance, decimals) => Number(balance.dividedBy(new BigNumber(10)
  .pow(decimals)).toFixed(config.math.DECIMALS_FOR_DISPLAY));

export const getLiquidityValue = (
  underlyingTokenReserve,
  totalLpTokenSupply,
  userLpTokenLiquidity,
) => (userLpTokenLiquidity * underlyingTokenReserve) / totalLpTokenSupply;
