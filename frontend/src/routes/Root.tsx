import CreateListingDialog from '@/components/dialogs/CreateListing';
import { Outlet } from 'react-router-dom';

export default function RootRoute() {
    return (
        <div>
            <header className="flex w-full flex-row justify-between p-2">
                <h1 className="text-xl font-semibold">Shopkeeper</h1>
                <div>
                    <CreateListingDialog />
                </div>
            </header>
            <Outlet />
        </div>
    );
}
