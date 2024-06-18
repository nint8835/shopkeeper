import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { useGetCurrentUser } from './queries/api/shopkeeperComponents';

const queryClient = new QueryClient();

function TestComponent() {
    const { data } = useGetCurrentUser({});

    return <div>{JSON.stringify(data)}</div>;
}

const router = createBrowserRouter([
    {
        path: '/',
        element: <TestComponent />,
    },
]);

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}

export default App;
