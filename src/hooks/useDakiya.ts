import { AES } from 'crypto-js';
import { uuid } from 'uuidv4';
import { ChainId } from '../contracts';
import { Message, ThreadData } from '../interface';
import {
  checkForMetamask,
  contract,
  decryptCipherMessage,
  decryptMessage,
  encryptMessage,
  fetchFromIPFS,
  getPublicEncryptionKey,
  uploadToIPFS,
} from '../utils/helpers';
import useApplication from './useApplication';
import useQueries from './useQueries';

export interface ReplyThreadParams {
  receiver: string;
  message: string;
  threadId: string;
  encryptionKey: string;
  senderPubEncKey: string;
  receiverPubEncKey: string;
  encrypt: boolean;
  chainId: ChainId;
}

export interface GetMessageParams {
  threadId: string;
  chainId: ChainId;
  encryptionKey: string;
  account: string;
}

export interface CreateThreadParams {
  receiver: string;
  subject: string;
  message: string;
  chainId: ChainId;
}

const useDakiya = (): {
  onboardUser: (account: string, chainId: ChainId) => Promise<void>;
  checkUserOnboarding: (chainId: ChainId) => Promise<boolean>;
  threadReply: (threadReplyParams: ReplyThreadParams) => Promise<void>;
  getMessagesFromThread: (messageParams: GetMessageParams) => Promise<ThreadData>;
  getSubject: ({ subjectURI, encryptionKey }: { subjectURI: string; encryptionKey: string }) => Promise<string>;
  startNewThread: (threadDetails: CreateThreadParams) => Promise<any>;
} => {
  const { getAllThreadMessages, getThread } = useQueries();
  const applicationKey = useApplication();
  console.log('applicationKey', applicationKey);

  const onboardUser = async (account: string, chainId: ChainId): Promise<void> => {
    const key = await getPublicEncryptionKey(account);
    await contract(chainId).setPubEncKey(key);
  };

  const checkUserOnboarding = async (chainId: ChainId): Promise<boolean> =>
    !!(await contract(chainId).checkUserRegistration());

  const threadReply = async (threadReplyParams: ReplyThreadParams): Promise<void> => {
    checkForMetamask();
    const { receiver, message, threadId, encryptionKey, senderPubEncKey, receiverPubEncKey, encrypt, chainId } =
      threadReplyParams;
    const dataToEncrypt = JSON.stringify({
      message,
    });
    const encryptedData = encrypt ? AES.encrypt(dataToEncrypt, encryptionKey).toString() : dataToEncrypt;
    const ipfsHash = await uploadToIPFS(encryptedData);

    // @abhishek add applicationKey

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

  const getMessagesFromThread = async (messageParams: GetMessageParams): Promise<ThreadData> => {
    checkForMetamask();
    const { threadId, chainId, encryptionKey, account } = messageParams;
    const threadData: ThreadData = {
      subject: '',
      messages: [],
      decryptedEncryptionKey: '',
      isEncrypted: false,
      senderKey: '',
      receiverKey: '',
    };

    const thread = await getThread({ threadId, chainId });

    // eslint-disable-next-line @typescript-eslint/camelcase
    const { _sender_key, _receiver_key, encrypted } = thread;

    // eslint-disable-next-line @typescript-eslint/camelcase
    threadData.senderKey = _sender_key as string;
    // eslint-disable-next-line @typescript-eslint/camelcase
    threadData.receiverKey = _receiver_key as string;

    const response = await getAllThreadMessages({ threadId, chainId });
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

  const getSubject = async ({
    subjectURI,
    encryptionKey,
  }: {
    subjectURI: string;
    encryptionKey: string;
  }): Promise<string> => {
    const ipfsMessage = await fetchFromIPFS(subjectURI);
    const decryptedString = decryptCipherMessage(ipfsMessage, encryptionKey);
    const parsedData = JSON.parse(decryptedString);
    return parsedData.subject;
  };

  const startNewThread = async (threadDetails: CreateThreadParams): Promise<any> => {
    checkForMetamask();
    const { receiver, subject, message, chainId } = threadDetails;
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

    // @abhishek add applicationKey

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

  return {
    onboardUser,
    checkUserOnboarding,
    threadReply,
    getSubject,
    getMessagesFromThread,
    startNewThread,
  };
};
export default useDakiya;
