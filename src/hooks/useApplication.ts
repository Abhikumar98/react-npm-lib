import { useContext } from 'react';
import { DakiyaContext } from '../context/DakiyaContext';

const useApplication = (): string => {
  const data = useContext(DakiyaContext);
  if (!data) {
    throw new Error('useApplication must be used within a DakiyaProvider');
  }
  return data.applicationKey;
};

export default useApplication;
