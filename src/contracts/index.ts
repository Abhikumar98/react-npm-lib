import contractABI from './abi';

export type ChainId = '0x1' | '0x89' | '0x4';

export const getContractDetails = (
  chainId: ChainId,
): {
  contractAddress: string;
  contractABI: any;
  subgraphURL: string;
} => {
  if (!chainId) {
    throw new Error('No chainId provided');
  }

  let contractAddress = '';
  let subgraphURL = '';

  const rinkebyContract = '0x355039B35222ea3E5eCbddfa0400BfC78E1ACEEf';
  const polygonContract = '0x4995ff34079d59a0dfd345dc95145f0159fd6c1e';
  const ethereumContract = '0x0761e0a5795be98fe806fa741a88f94ebec76c2b';

  if (chainId === '0x4') {
    contractAddress = rinkebyContract;
    subgraphURL = 'https://api.thegraph.com/subgraphs/name/anoushk1234/dakiya-rinkeby';
  } else if (chainId === '0x89') {
    contractAddress = polygonContract;
    subgraphURL = 'https://api.thegraph.com/subgraphs/name/anoushk1234/dakiya-polygon';
    console.log({ subgraphURL });
  } else if (chainId === '0x1') {
    contractAddress = ethereumContract;
    subgraphURL = 'https://api.thegraph.com/subgraphs/name/anoushk1234/onchain-dakiya';
  }

  return {
    contractAddress,
    contractABI,
    subgraphURL,
  };
};
