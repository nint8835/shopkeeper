import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider, createBrowserRouter, redirectDocument } from 'react-router-dom';
import { fetchGetCurrentUser } from './queries/api/shopkeeperComponents';
import RootRoute from './routes/root';

const queryClient = new QueryClient();

const router = createBrowserRouter([
    {
        path: '/',
        element: <RootRoute />,
        loader: async () => {
            const currentUser = await fetchGetCurrentUser({});
            if (!currentUser) {
                return redirectDocument('/auth/login');
            }

            return currentUser;
        },
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
