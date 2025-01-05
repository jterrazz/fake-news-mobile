import { createContext, useContext } from 'react';

import { type Container, container } from '@/core/container';

const ContainerContext = createContext<Container | null>(null);

export const ContainerProvider = ({ children }: { children: React.ReactNode }) => (
    <ContainerContext.Provider value={container}>{children}</ContainerContext.Provider>
);

export const useContainer = () => {
    const context = useContext(ContainerContext);
    if (!context) throw new Error('useContainer must be used within ContainerProvider');
    return context;
};
