import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useStore } from '@/lib/state';
import { Route } from '@/routes/index';
import type { CheckedState } from '@radix-ui/react-checkbox';
import { useNavigate, UseNavigateResult } from '@tanstack/react-router';
import { Filter } from 'lucide-react';

// TODO: Fix behaviour when filtering to only user's listings
function paramToggler<K extends Exclude<keyof typeof Route.types.searchSchema, 'has_issues'>>(
    filters: typeof Route.types.searchSchema,
    navigate: UseNavigateResult<'/'>,
    key: K,
    value: (typeof Route.types.searchSchema)[K] extends Array<infer U> | undefined ? U : never,
) {
    return (checked: CheckedState) => {
        const currentState = (filters[key]! as Array<typeof value>).includes(value);
        const newState = !!checked;
        if (newState === currentState) {
            return;
        }
        navigate({
            search: (prevSearch) => ({
                ...prevSearch,
                [key]: (newState
                    ? prevSearch[key]?.concat(value as string)
                    : (prevSearch[key] as (typeof value)[] | undefined)?.filter((v) => v !== value)
                )?.sort(),
            }),
        });
    };
}

function StatusFilter() {
    const filters = Route.useSearch();
    const navigate = useNavigate({ from: Route.fullPath });

    return (
        <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="open-status-checkbox"
                    checked={filters.status.includes('open')}
                    onCheckedChange={paramToggler(filters, navigate, 'status', 'open')}
                />
                <label htmlFor="open-status-checkbox" className="text-sm leading-none">
                    Open
                </label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="pending-status-checkbox"
                    checked={filters.status.includes('pending')}
                    onCheckedChange={paramToggler(filters, navigate, 'status', 'pending')}
                />
                <label htmlFor="pending-status-checkbox" className="text-sm leading-none">
                    Pending
                </label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="closed-status-checkbox"
                    checked={filters.status.includes('closed')}
                    onCheckedChange={paramToggler(filters, navigate, 'status', 'closed')}
                />
                <label htmlFor="closed-status-checkbox" className="text-sm leading-none">
                    Closed
                </label>
            </div>
        </div>
    );
}

function OwnerFilter() {
    const filters = Route.useSearch();
    const navigate = useNavigate({ from: Route.fullPath });
    const currentUserId = useStore((state) => state.user?.id);

    return (
        <div className="space-y-2">
            <Label>Owner</Label>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="only-mine-checkbox"
                    checked={filters.owner && filters.owner.includes(currentUserId)}
                    onCheckedChange={paramToggler(filters, navigate, 'owner', currentUserId)}
                />
                <label htmlFor="only-mine-checkbox" className="text-sm leading-none">
                    Show only my listings
                </label>
            </div>
        </div>
    );
}

function TypeFilter() {
    const filters = Route.useSearch();
    const navigate = useNavigate({ from: Route.fullPath });

    return (
        <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="sell-type-checkbox"
                    checked={filters.type.includes('sell')}
                    onCheckedChange={paramToggler(filters, navigate, 'type', 'sell')}
                />
                <label htmlFor="sell-type-checkbox" className="text-sm leading-none">
                    For sale
                </label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="buy-type-checkbox"
                    checked={filters.type.includes('buy')}
                    onCheckedChange={paramToggler(filters, navigate, 'type', 'buy')}
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
