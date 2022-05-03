import { ChainId } from '../contracts';
import {
  fetchMessages,
  getAllThreadMessages,
  getAllUserSentThreads,
  getAllUserThreads,
  getThread,
} from '../utils/queries';
import useApplication from './useApplication';

interface AccountQueryBuilderType {
  readonly applicationKey: string;
  readonly chainId: ChainId;
  readonly address: string;
  readonly threadId: string;
  readonly limit: number;
}

// type QueryBuildType = { ChainId, string, string;

const applicationQueryBuilder = (applicationKey: string) => (func: Function) => {
  return function query(this: any, args: Partial<AccountQueryBuilderType>) {
    const arg = [args.address, applicationKey, args.chainId, args.limit, args.threadId];
    return func.apply(this, arg);
  };
};

const useQueries = (): {
  fetchMessages: (args: Partial<AccountQueryBuilderType>) => Promise<any>;
  getAllUserThreads: (args: Partial<AccountQueryBuilderType>) => Promise<any>;
  getAllUserSentThreads: (args: Partial<AccountQueryBuilderType>) => Promise<any>;
  getThread: (args: Partial<AccountQueryBuilderType>) => Promise<any>;
  getAllThreadMessages: (args: Partial<AccountQueryBuilderType>) => Promise<any>;
} => {
  const applicationKey = useApplication();

  const wrapperFetchMessages = applicationQueryBuilder(applicationKey)(fetchMessages);
  const wrapperGetAllUserThreads = applicationQueryBuilder(applicationKey)(getAllUserThreads);
  const wrapperGetAllUserSentThreads = applicationQueryBuilder(applicationKey)(getAllUserSentThreads);
  const wrapperGetThread = applicationQueryBuilder(applicationKey)(getThread);
  const wrapperGetAllThreadMessages = applicationQueryBuilder(applicationKey)(getAllThreadMessages);

  return {
    fetchMessages: wrapperFetchMessages,
    getAllUserThreads: wrapperGetAllUserThreads,
    getAllUserSentThreads: wrapperGetAllUserSentThreads,
    getThread: wrapperGetThread,
    getAllThreadMessages: wrapperGetAllThreadMessages,
  };
};

export default useQueries;
