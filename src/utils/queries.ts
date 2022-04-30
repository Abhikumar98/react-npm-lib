import { ChainId, getContractDetails } from '../contracts';
import axios from 'axios';

export const fetchMessages = async (
  limit: number,
  chainId: ChainId,
  // page: number
): Promise<any> => {
  const { subgraphURL } = getContractDetails(chainId);
  const response = await axios.post(subgraphURL, {
    query: `{
                messages(first: ${limit}) {
                    id
                    _receiver
                    _sender
                    _uri
                    _timestamp
                }
        }`,
  });

  return response.data.data.messages;
};

export const getAllUserThreads = async (address: string, chainId: ChainId): Promise<any> => {
  if (!address) return null;

  const { subgraphURL } = getContractDetails(chainId);
  console.log({ chainId, subgraphURL });
  const response = await axios.post(subgraphURL, {
    query: `{
          threads(where: { _receiver: "${address}" }) {
              id
              _receiver
					_sender
					_thread_id
					_timestamp
					encrypted
                }
        }`,
  });

  return response.data.data.threads;
};

export const getAllUserSentThreads = async (address: string, chainId: ChainId): Promise<any> => {
  if (!address) return null;

  const { subgraphURL } = getContractDetails(chainId);
  console.log({ subgraphURL });
  const response = await axios.post(subgraphURL, {
    query: `{
			threads(where: { _sender: "${address}" }) {
				id
				_receiver
				_sender
				_thread_id
				_timestamp
				encrypted
			}
        }`,
  });

  return response.data.data.threads;
};
export const getThread = async (threadId: string, chainId: ChainId): Promise<any> => {
  const { subgraphURL } = getContractDetails(chainId);
  const response = await axios.post(subgraphURL, {
    query: `{
                threads(where: { _thread_id: "${threadId}" }) {
                    id
                    _receiver
					_sender
					_thread_id
					_timestamp
					_sender_key
					_receiver_key
					encrypted
                }
        }`,
  });

  return response.data.data.threads[0];
};

export const getAllThreadMessages = async (threadId: string, chainId: ChainId): Promise<any> => {
  const { subgraphURL } = getContractDetails(chainId);
  const response = await axios.post(subgraphURL, {
    query: `{
                messages(first: ${100}, where: { _thread_id: ${threadId} }) {
                    id
                    _receiver
					_sender
					_thread_id
					_timestamp
					_uri
                }
        }`,
  });

  return response.data.data.messages;
};
