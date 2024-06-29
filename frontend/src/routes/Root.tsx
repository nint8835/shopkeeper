import { Outlet } from 'react-router-dom';

export default function RootRoute() {
    return (
        <div>
            <header className="w-full p-2">
                <h1 className="text-xl font-semibold">Shopkeeper</h1>
            </header>
            <Outlet />
        </div>
    );
}
