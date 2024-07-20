import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ListingStatus } from '@/queries/api/shopkeeperSchemas';
import { Filter } from 'lucide-react';

function StatusFilter({
    selectedStatuses,
    setSelectedStatuses,
}: {
    selectedStatuses: Record<ListingStatus, boolean>;
    setSelectedStatuses: (selectedStatuses: Record<ListingStatus, boolean>) => void;
}) {
    return (
        <div className="space-y-2">
            <Label>Status</Label>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="open-status-checkbox"
                    checked={selectedStatuses['open']}
                    onCheckedChange={(state) => setSelectedStatuses({ ...selectedStatuses, open: !!state })}
                />
                <label htmlFor="open-status-checkbox" className="text-sm leading-none">
                    Open
                </label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="pending-status-checkbox"
                    checked={selectedStatuses['pending']}
                    onCheckedChange={(state) => setSelectedStatuses({ ...selectedStatuses, pending: !!state })}
                />
                <label htmlFor="pending-status-checkbox" className="text-sm leading-none">
                    Pending
                </label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="closed-status-checkbox"
                    checked={selectedStatuses['closed']}
                    onCheckedChange={(state) => setSelectedStatuses({ ...selectedStatuses, closed: !!state })}
                />
                <label htmlFor="closed-status-checkbox" className="text-sm leading-none">
                    Closed
                </label>
            </div>
        </div>
    );
}

function OwnerFilter({ onlyMine, setOnlyMine }: { onlyMine: boolean; setOnlyMine: (onlyMine: boolean) => void }) {
    return (
        <div className="space-y-2">
            <Label>Owner</Label>
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="only-mine-checkbox"
                    checked={onlyMine}
                    onCheckedChange={(state) => setOnlyMine(!!state)}
                />
                <label htmlFor="only-mine-checkbox" className="text-sm leading-none">
                    Show only my listings
                </label>
            </div>
        </div>
    );
}

export default function ListingFiltersDialog({
    selectedStatuses,
    setSelectedStatuses,
    onlyMine,
    setOnlyMine,
}: {
    selectedStatuses: Record<ListingStatus, boolean>;
    setSelectedStatuses: (selectedStatuses: Record<ListingStatus, boolean>) => void;
    onlyMine: boolean;
    setOnlyMine: (onlyMine: boolean) => void;
}) {
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
                    <StatusFilter selectedStatuses={selectedStatuses} setSelectedStatuses={setSelectedStatuses} />
                    <OwnerFilter onlyMine={onlyMine} setOnlyMine={setOnlyMine} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
