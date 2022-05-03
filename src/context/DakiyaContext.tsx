import React from 'react';
export interface DakiyaContextType {
  readonly applicationKey: string;
}

export const DakiyaContext = React.createContext<DakiyaContextType | null>(null);

export const DakiyaProvider: React.FC<DakiyaContextType> = ({ children, applicationKey }) => {
  return <DakiyaContext.Provider value={{ applicationKey }}>{children}</DakiyaContext.Provider>;
};
