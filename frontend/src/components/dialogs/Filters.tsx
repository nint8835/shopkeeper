import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useStore } from '@/lib/state';
import { Route } from '@/routes/index';
import { Button, Checkbox } from '@heroui/react';
import { useNavigate, UseNavigateResult } from '@tanstack/react-router';
import { Filter } from 'lucide-react';

function paramToggler<
    K extends Exclude<keyof typeof Route.types.searchSchema, 'has_issues'>,
    V extends (typeof Route.types.searchSchema)[K] extends Array<infer U> | undefined ? U : never,
>(filters: typeof Route.types.searchSchema, navigate: UseNavigateResult<'/'>, key: K, value: V) {
    return (checked: boolean) => {
        let currentValue = filters[key] as V[] | undefined;

        if (currentValue === undefined) {
            currentValue = [] as V[];
        }

        const currentState = currentValue.includes(value);
        const newState = !!checked;
        if (newState === currentState) {
            return;
        }
        navigate({
            search: (prevSearch) => ({
                ...prevSearch,
                [key]: (newState ? currentValue.concat(value) : currentValue.filter((v) => v !== value))?.sort(),
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
                    isSelected={filters.status.includes('open')}
                    onValueChange={paramToggler(filters, navigate, 'status', 'open')}
                >
                    Open
                </Checkbox>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox
                    isSelected={filters.status.includes('pending')}
                    onValueChange={paramToggler(filters, navigate, 'status', 'pending')}
                >
                    Pending
                </Checkbox>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox
                    isSelected={filters.status.includes('closed')}
                    onValueChange={paramToggler(filters, navigate, 'status', 'closed')}
                >
                    Closed
                </Checkbox>
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
                    isSelected={filters.owner !== undefined && filters.owner.includes(currentUserId)}
                    onValueChange={paramToggler(filters, navigate, 'owner', currentUserId)}
                >
                    Show only my listings
                </Checkbox>
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
                    isSelected={filters.type.includes('sell')}
                    onValueChange={paramToggler(filters, navigate, 'type', 'sell')}
                >
                    For sale
                </Checkbox>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox
                    isSelected={filters.type.includes('buy')}
                    onValueChange={paramToggler(filters, navigate, 'type', 'buy')}
                >
                    Looking to buy
                </Checkbox>
            </div>
        </div>
    );
}

export default function ListingFiltersDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="bordered">
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
