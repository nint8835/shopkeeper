import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useStore } from '@/lib/state';
import type { CheckedState } from '@radix-ui/react-checkbox';
import { Filter } from 'lucide-react';
import { type SetURLSearchParams, useSearchParams } from 'react-router-dom';

function paramToggler(searchParams: URLSearchParams, setSearchParams: SetURLSearchParams, key: string, value: string) {
    return (checked: CheckedState) => {
        const currentState = searchParams.getAll(key).includes(value);
        const newState = !!checked;
        if (newState === currentState) {
            return;
        }
        setSearchParams((params) => {
            if (newState) {
                params.append(key, value);
            } else {
                params.delete(key, value);
            }
            return params;
        });
    };
}

function StatusFilter() {
    const [searchParams, setSearchParams] = useSearchParams({ status: ['open', 'pending'] });

    return (
        <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="open-status-checkbox"
                    checked={searchParams.getAll('status').includes('open')}
                    onCheckedChange={paramToggler(searchParams, setSearchParams, 'status', 'open')}
                />
                <label htmlFor="open-status-checkbox" className="text-sm leading-none">
                    Open
                </label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="pending-status-checkbox"
                    checked={searchParams.getAll('status').includes('pending')}
                    onCheckedChange={paramToggler(searchParams, setSearchParams, 'status', 'pending')}
                />
                <label htmlFor="pending-status-checkbox" className="text-sm leading-none">
                    Pending
                </label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="closed-status-checkbox"
                    checked={searchParams.getAll('status').includes('closed')}
                    onCheckedChange={paramToggler(searchParams, setSearchParams, 'status', 'closed')}
                />
                <label htmlFor="closed-status-checkbox" className="text-sm leading-none">
                    Closed
                </label>
            </div>
        </div>
    );
}

function OwnerFilter() {
    const [searchParams, setSearchParams] = useSearchParams({ owner: [] });
    const currentUserId = useStore((state) => state.user?.id);

    return (
        <div className="space-y-2">
            <Label>Owner</Label>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="only-mine-checkbox"
                    checked={searchParams.getAll('owner').includes(currentUserId)}
                    onCheckedChange={paramToggler(searchParams, setSearchParams, 'owner', currentUserId)}
                />
                <label htmlFor="only-mine-checkbox" className="text-sm leading-none">
                    Show only my listings
                </label>
            </div>
        </div>
    );
}

function TypeFilter() {
    const [searchParams, setSearchParams] = useSearchParams({ type: ['sell', 'buy'] });

    return (
        <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="sell-type-checkbox"
                    checked={searchParams.getAll('type').includes('sell')}
                    onCheckedChange={paramToggler(searchParams, setSearchParams, 'type', 'sell')}
                />
                <label htmlFor="sell-type-checkbox" className="text-sm leading-none">
                    For sale
                </label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="buy-type-checkbox"
                    checked={searchParams.getAll('type').includes('buy')}
                    onCheckedChange={paramToggler(searchParams, setSearchParams, 'type', 'buy')}
                />
                <label htmlFor="buy-type-checkbox" className="text-sm leading-none">
                    Looking to buy
                </label>
            </div>
        </div>
    );
}

export default function ListingFiltersDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" /> Filters
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Filters</DialogTitle>
                </DialogHeader>
                <div className="space-y-8">
                    <StatusFilter />
                    <TypeFilter />
                    <OwnerFilter />
                </div>
            </DialogContent>
        </Dialog>
    );
}
