import {
    QueryClient,
    QueryClientProvider as ReactQueryClientProvider,
} from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 2,
            staleTime: 1000 * 60 * 5, // 5 minutes
        },
    },
});

export const QueryClientProvider = ({ children }: { children: React.ReactNode }) => (
    <ReactQueryClientProvider client={queryClient}>{children}</ReactQueryClientProvider>
);
