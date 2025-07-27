import { queryClient } from '@/lib/query';
import { useStore } from '@/lib/state';
import { fetchGetCurrentUser } from '@/queries/api/shopkeeperComponents';
import { HeroUIProvider, ToastProvider } from '@heroui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Outlet, createRootRoute, redirect } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

export const Route = createRootRoute({
    component: RootComponent,
    beforeLoad: async () => {
        if (useStore.getState().user.id) {
            return;
        }

        const currentUser = await fetchGetCurrentUser({});
        if (!currentUser) {
            throw redirect({
                to: '/auth/login',
                reloadDocument: true,
            });
        }
        useStore.getState().setUser(currentUser);
    },
});

function RootComponent() {
    return (
        <HeroUIProvider>
            <QueryClientProvider client={queryClient}>
                <Outlet />
                <ToastProvider />
                <ReactQueryDevtools initialIsOpen={false} />
                <TanStackRouterDevtools />
            </QueryClientProvider>
        </HeroUIProvider>
    );
}
