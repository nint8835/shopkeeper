import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider, createBrowserRouter, redirectDocument } from 'react-router-dom';
import { fetchGetCurrentUser } from './queries/api/shopkeeperComponents';
import ListingsRoute from './routes/Listings';
import RootRoute from './routes/Root';

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
        children: [
            {
                index: true,
                element: <ListingsRoute />,
            },
        ],
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
