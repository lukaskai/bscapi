import BigNumber from 'bignumber.js';
import config from '../../config';

export const getFullDisplayBalance = (balance, decimals) => Number((new BigNumber(balance)).dividedBy(new BigNumber(10)
  .pow(decimals)).toFixed(config.math.DECIMALS_FOR_DISPLAY));

export const getLiquidityValue = (
  underlyingTokenReserve,
  totalLpTokenSupply,
  userLpTokenLiquidity,
) => (userLpTokenLiquidity * underlyingTokenReserve) / totalLpTokenSupply;

export const getAddress = (address) => address[config.web3.CHAIN_ID];
export const getMasterChefAddress = (addresses) => getAddress(addresses.masterChef);
