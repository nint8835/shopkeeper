import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useStore } from '@/lib/state';
import { ListingStatus } from '@/queries/api/shopkeeperSchemas';
import { Filter } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

function StatusFilter() {
    const [searchParams, setSearchParams] = useSearchParams({ status: ['open', 'pending'] });

    function toggleStatus(status: ListingStatus, newState: boolean) {
        const currentState = searchParams.getAll('status').includes(status);
        if (newState === currentState) {
            return;
        }
        if (newState) {
            setSearchParams((params) => {
                params.append('status', status);
                return params;
            });
        } else {
            setSearchParams((params) => {
                params.delete('status', status);
                return params;
            });
        }
    }

    return (
        <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="open-status-checkbox"
                    checked={searchParams.getAll('status').includes('open')}
                    onCheckedChange={(state) => toggleStatus('open', !!state)}
                />
                <label htmlFor="open-status-checkbox" className="text-sm leading-none">
                    Open
                </label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="pending-status-checkbox"
                    checked={searchParams.getAll('status').includes('pending')}
                    onCheckedChange={(state) => toggleStatus('pending', !!state)}
                />
                <label htmlFor="pending-status-checkbox" className="text-sm leading-none">
                    Pending
                </label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="closed-status-checkbox"
                    checked={searchParams.getAll('status').includes('closed')}
                    onCheckedChange={(state) => toggleStatus('closed', !!state)}
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

    function toggleOnlyMine(newState: boolean) {
        const currentState = searchParams.getAll('owner').includes(currentUserId);
        if (newState === currentState) {
            return;
        }
        if (newState) {
            setSearchParams((params) => {
                params.append('owner', currentUserId);
                return params;
            });
        } else {
            setSearchParams((params) => {
                params.delete('owner', currentUserId);
                return params;
            });
        }
    }

    return (
        <div className="space-y-2">
            <Label>Owner</Label>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="only-mine-checkbox"
                    checked={searchParams.getAll('owner').includes(currentUserId)}
                    onCheckedChange={(state) => toggleOnlyMine(!!state)}
                />
                <label htmlFor="only-mine-checkbox" className="text-sm leading-none">
                    Show only my listings
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
                    <OwnerFilter />
                </div>
            </DialogContent>
        </Dialog>
    );
}
