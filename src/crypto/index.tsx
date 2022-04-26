import { AES } from 'crypto-js';
import { uuid } from 'uuidv4';
import { ChainId } from '../contracts';
import { ThreadData, Message } from '../interface';
import {
  contract,
  decryptCipherMessage,
  decryptMessage,
  encryptMessage,
  fetchFromIPFS,
  getPublicEncryptionKey,
  uploadToIPFS,
} from '../utils/helpers';
import { getThread, getAllThreadMessages } from '../utils/queries';

export const onboardUser = async (account: string, chainId: ChainId): Promise<void> => {
  const key = await getPublicEncryptionKey(account);
  await contract(chainId).setPubEncKey(key);
};

export const checkUserOnboarding = async (chainId: ChainId): Promise<boolean> =>
  !!(await contract(chainId).checkUserRegistration());

export const startNewThread = async (
  receiver: string,
  subject: string,
  message: string,
  chainId: ChainId,
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
  chainId: ChainId,
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
  chainId: ChainId,
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
