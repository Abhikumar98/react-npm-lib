import { getAllThreadMessages, getThread } from './queries';
import { encrypt } from '@metamask/eth-sig-util';
import { create } from 'ipfs-http-client';
import { AES, enc } from 'crypto-js';
import { ethers } from 'ethers';
import { uuid } from 'uuidv4';
import { getContractDetails } from '../contracts';
import { Message, ThreadData } from '../interface';

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

export const contract = (chainId: string): ethers.Contract => {
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

export const saveMessageOnIPFS = async (
  receiver: string,
  subject: string,
  message: string,
  chainId: string,
): Promise<any> => {
  const [senderPubEncKey, receiverPubEncKey] = await contract(chainId).getPubEncKeys(receiver);

  const dataToEncrypt = JSON.stringify({
    message,
    subject,
    encrypted: !!receiverPubEncKey,
  });

  const encryptionKey = uuid();
  const encryptedData = !!receiverPubEncKey ? AES.encrypt(dataToEncrypt, encryptionKey).toString() : dataToEncrypt;

  const senderPubKeyEnc = !!receiverPubEncKey ? await encryptMessage(encryptionKey, senderPubEncKey) : '';

  const receiverPubKeyEnc = !!receiverPubEncKey ? await encryptMessage(encryptionKey, receiverPubEncKey) : '';

  const ipfsHash = await uploadToIPFS(encryptedData);

  const response = await contract(chainId).sendMessage(
    0,
    ipfsHash,
    receiver,
    senderPubKeyEnc,
    receiverPubKeyEnc,
    !!receiverPubEncKey,
  );
  return response;
};

export const threadReply = async (
  receiver: string,
  message: string,
  threadId: string,
  encryptionKey: string,
  senderPubEncKey: string,
  receiverPubEncKey: string,
  encrypt: boolean,
  chainId: string,
): Promise<void> => {
  const dataToEncrypt = JSON.stringify({
    message,
  });
  const encryptedData = encrypt ? AES.encrypt(dataToEncrypt, encryptionKey).toString() : dataToEncrypt;
  const ipfsHash = await uploadToIPFS(encryptedData);

  const tx = await contract(chainId).sendMessage(
    threadId,
    ipfsHash,
    receiver,
    senderPubEncKey,
    receiverPubEncKey,
    encrypt,
  );

  await tx.wait();
};

export const getMessagesFromThread = async (
  threadId: string,
  chainId: string,
  encryptionKey: string,
  account: string,
): Promise<ThreadData> => {
  const threadData: ThreadData = {
    subject: '',
    messages: [],
    decryptedEncryptionKey: '',
    isEncrypted: false,
    senderKey: '',
    receiverKey: '',
  };

  const thread = await getThread(threadId, chainId);

  // eslint-disable-next-line @typescript-eslint/camelcase
  const { _sender_key, _receiver_key, encrypted } = thread;

  // eslint-disable-next-line @typescript-eslint/camelcase
  threadData.senderKey = _sender_key as string;
  // eslint-disable-next-line @typescript-eslint/camelcase
  threadData.receiverKey = _receiver_key as string;

  const response = await getAllThreadMessages(threadId, chainId);
  const cleanedMessages: Message[] = response
    .map((message: any) => {
      const newMessage: Message = {
        txId: message.id,
        receiver: message._receiver,
        sender: message._sender,
        timestamp: message._timestamp,
        message: '',
        subject: '',
        uri: message._uri,
      };
      return newMessage;
    })
    .sort((a: { timestamp: number }, b: { timestamp: number }) => a.timestamp - b.timestamp);

  if (!encrypted) {
    threadData.isEncrypted = false;
    const ipfsMessage = await fetchFromIPFS(cleanedMessages[0]?.uri);
    threadData.subject = JSON.parse(ipfsMessage);
  }

  if (!encryptionKey && encrypted) {
    threadData.isEncrypted = true;
    if (cleanedMessages[0].sender === account) {
      threadData.decryptedEncryptionKey = await decryptMessage(_sender_key);
    } else {
      threadData.decryptedEncryptionKey = await decryptMessage(_receiver_key);
    }
  }

  threadData.messages = cleanedMessages;

  return threadData;
};

export const getSubject = async (subjectURI: string, encryptionKey: string): Promise<string> => {
  const ipfsMessage = await fetchFromIPFS(subjectURI);
  const decryptedString = decryptCipherMessage(ipfsMessage, encryptionKey);
  const parsedData = JSON.parse(decryptedString);
  return parsedData.subject;
};
