import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useGetListingsApiListingsGet } from './queries/api/shopkeeperComponents';

const queryClient = new QueryClient();

function TestComponent() {
    const { data } = useGetListingsApiListingsGet({});

    return <div>{JSON.stringify(data)}</div>;
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <TestComponent />
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}

export default App;
