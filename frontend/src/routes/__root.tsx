import { queryClient } from '@/lib/query';
import { useStore } from '@/lib/state';
import { fetchGetCurrentUser } from '@/queries/api/shopkeeperComponents';
import { HeroUIProvider, ToastProvider } from '@heroui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { NavigateOptions, Outlet, ToOptions, createRootRoute, redirect, useRouter } from '@tanstack/react-router';
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

declare module '@react-types/shared' {
    interface RouterConfig {
        href: ToOptions['to'];
        routerOptions: Omit<NavigateOptions, keyof ToOptions>;
    }
}

function RootComponent() {
    const router = useRouter();

    return (
        <HeroUIProvider
            navigate={(to, options) => router.navigate({ to, ...options })}
            useHref={(to) => router.buildLocation({ to }).href}
        >
            <QueryClientProvider client={queryClient}>
                <Outlet />
                <ToastProvider />
                <ReactQueryDevtools initialIsOpen={false} />
                <TanStackRouterDevtools />
            </QueryClientProvider>
        </HeroUIProvider>
    );
}
