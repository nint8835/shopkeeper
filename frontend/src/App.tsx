import { Toaster } from '@/components/ui/sonner';
import { queryClient } from '@/lib/query';
import { fetchGetCurrentUser } from '@/queries/api/shopkeeperComponents';
import ListingsRoute from '@/routes/Listings';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider, createBrowserRouter, redirectDocument } from 'react-router-dom';
import { useStore } from './lib/state';

const router = createBrowserRouter([
    {
        path: '/',
        loader: async () => {
            const currentUser = await fetchGetCurrentUser({});
            if (!currentUser) {
                return redirectDocument('/auth/login');
            }

            useStore.getState().setUser(currentUser);

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
            <Toaster />
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}

export default App;
