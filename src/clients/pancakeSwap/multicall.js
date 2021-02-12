import { Interface } from '@ethersproject/abi';
import Web3 from 'web3';
import { Multicall } from '../abi/Multicall';
import config from '../../config';
import addresses from './constants/contracts';

const web3 = new Web3(new Web3.providers.HttpProvider(config.web3.HTTP_PROVIDER));

export const getAddress = (address) => {
  const mainNetChainId = 56;
  return address[mainNetChainId];
};


export const getMulticallAddress = () => getAddress(addresses.mulltiCall);

const multicall = async (abi, calls) => {
  const multi = new web3.eth.Contract((Multicall), getMulticallAddress());
  const itf = new Interface(abi);

  const calldata = calls.map((call) => [call.address.toLowerCase(), itf.encodeFunctionData(call.name, call.params)]);
  const { returnData } = await multi.methods.aggregate(calldata).call();
  const res = returnData.map((call, i) => itf.decodeFunctionResult(calls[i].name, call));

  return res;
};

export default multicall;
