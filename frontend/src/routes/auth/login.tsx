import { createFileRoute, redirect } from '@tanstack/react-router';

// This route should never be handled by the router - it exists to allow calls to `redirect` to be correctly typed
// In the event it is ever handled by the router, the beforeLoad should force a reload to cause the API on the backend to handle it

export const Route = createFileRoute('/auth/login')({
    component: RouteComponent,
    beforeLoad: async ({ location }) => {
        throw redirect({
            href: location.href,
            reloadDocument: true,
        });
    },
});

function RouteComponent() {
    throw new Error('This should never be rendered');
}
