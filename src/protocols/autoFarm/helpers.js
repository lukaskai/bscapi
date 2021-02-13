import BigNumber from 'bignumber.js';
import config from '../../config';
import addresses from './constants/contracts';

export const getAddress = (address) => address[config.web3.CHAIN_ID];
export const getFullDisplayBalance = (balance, decimals) => Number(balance.dividedBy(new BigNumber(10)
  .pow(decimals)).toFixed(config.math.DECIMALS_FOR_DISPLAY));
export const getMasterChefAddress = () => getAddress(addresses.masterChef);
export const getMulticallAddress = () => getAddress(addresses.mulltiCall);

export const getLiquidityValue = (
  underlyingTokenReserve,
  totalLpTokenSupply,
  userLpTokenLiquidity,
) => (userLpTokenLiquidity * underlyingTokenReserve) / totalLpTokenSupply;
