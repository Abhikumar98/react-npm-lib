import { encrypt } from '@metamask/eth-sig-util';
import { AES, enc } from 'crypto-js';
import { ethers } from 'ethers';
import { create } from 'ipfs-http-client';
import { ChainId, getContractDetails } from '../contracts';

declare let window: {
  ethereum?: any;
};

export const encryptMessage = async (message: string, publicKey: string): Promise<string> => {
  const encryptedData = encrypt({
    publicKey,
    data: message,
    version: 'x25519-xsalsa20-poly1305',
  });
  const hexValue = ethers.utils.hexlify(Buffer.from(JSON.stringify(encryptedData)));
  return hexValue;
};

export const decryptMessage = async (cipherText: string): Promise<string> => {
  const { ethereum } = window;

  if (!ethereum) {
    throw new Error('No ethereum object found');
  }
  const decryptedData = await ethereum.request({
    method: 'eth_decrypt',
    params: [cipherText, ethereum.selectedAddress],
  });
  return decryptedData;
};

export const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
});

export const uploadToIPFS = async (message: string): Promise<string> => {
  const buffer = Buffer.from(message);
  console.log({ buffer });
  const result = await ipfs.add(buffer);
  const ipfsHash = result.cid.toString();
  return ipfsHash;
};

export const fetchFromIPFS = async (uri: string): Promise<string> => {
  const result = await fetch(`https://ipfs.io/ipfs/${uri}`);
  const text = await result.text();
  return text;
};

export const contract = (chainId: ChainId): ethers.Contract => {
  console.log('🚀 ~ file: crypto.ts ~ line 126 ~ contract ~ chainId', chainId);
  const { contractABI, contractAddress } = getContractDetails(chainId);
  console.log({ contractAddress, chainId });
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const { ethereum } = window;
  if (!ethereum) {
    throw new Error('No ethereum object found');
  }
  const signer = provider.getSigner();
  const contractReader = new ethers.Contract(contractAddress, contractABI, signer);
  return contractReader;
};

export const decryptCipherMessage = (message: string, encKey: string): string => {
  return AES.decrypt(message, encKey).toString(enc.Utf8);
};

export const getPublicEncryptionKey = async (account: string): Promise<string | null> => {
  const { ethereum } = window;

  if (ethereum) {
    const pubEncryptionKey = await ethereum.request({
      method: 'eth_getEncryptionPublicKey',
      params: [account],
    });

    return pubEncryptionKey;
  }

  return null;
};
