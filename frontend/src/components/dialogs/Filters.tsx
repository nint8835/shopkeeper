import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useStore } from '@/lib/state';
import { ListingStatus, ListingType } from '@/queries/api/shopkeeperSchemas';
import { Route } from '@/routes/index';
import { Button, Checkbox, CheckboxGroup } from '@heroui/react';
import { useNavigate } from '@tanstack/react-router';
import { Filter } from 'lucide-react';

function StatusFilter() {
    const filters = Route.useSearch();
    const navigate = useNavigate({ from: Route.fullPath });

    return (
        <CheckboxGroup
            label="Status"
            value={filters.status}
            onValueChange={(values) =>
                navigate({ search: (prevSearch) => ({ ...prevSearch, status: values as ListingStatus[] }) })
            }
        >
            <Checkbox value="open">Open</Checkbox>
            <Checkbox value="pending">Pending</Checkbox>
            <Checkbox value="closed">Closed</Checkbox>
        </CheckboxGroup>
    );
}

function OwnerFilter() {
    const filters = Route.useSearch();
    const navigate = useNavigate({ from: Route.fullPath });
    const currentUserId = useStore((state) => state.user?.id);

    return (
        <CheckboxGroup
            label="Owner"
            value={filters.owner || []}
            onValueChange={(values) =>
                navigate({ search: (prevSearch) => ({ ...prevSearch, owner: values as string[] }) })
            }
        >
            <Checkbox value={currentUserId}>Show only my listings</Checkbox>
        </CheckboxGroup>
    );
}

function TypeFilter() {
    const filters = Route.useSearch();
    const navigate = useNavigate({ from: Route.fullPath });

    return (
        <CheckboxGroup
            label="Type"
            value={filters.type}
            onValueChange={(values) =>
                navigate({ search: (prevSearch) => ({ ...prevSearch, type: values as ListingType[] }) })
            }
        >
            <Checkbox value="sell">For sale</Checkbox>
            <Checkbox value="buy">Looking to buy</Checkbox>
        </CheckboxGroup>
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
