import CreateListingDialog from '@/components/dialogs/CreateListing';
import EditListingDialog from '@/components/dialogs/EditListing';
import ListingFiltersDialog from '@/components/dialogs/Filters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useStore } from '@/lib/state';
import { cn } from '@/lib/utils';
import { useGetListings } from '@/queries/api/shopkeeperComponents';
import { FullListingSchema, ListingStatus } from '@/queries/api/shopkeeperSchemas';
import { keepPreviousData } from '@tanstack/react-query';
import { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGemoji from 'remark-gemoji';

function DiscordMarkdownField({ text }: { text: string }) {
    return (
        <Markdown className="prose prose-zinc prose-invert" remarkPlugins={[remarkGemoji]}>
            {text}
        </Markdown>
    );
}

function ListingCard({ listing }: { listing: FullListingSchema }) {
    const { user } = useStore();

    return (
        <Card
            className={cn(
                'flex flex-col',
                listing.status !== 'open' && 'border-l-4',
                { open: '', pending: 'border-l-yellow-400', closed: 'border-l-red-400' }[listing.status],
            )}
        >
            <CardHeader>
                <CardTitle className="w-full overflow-hidden text-ellipsis" title={listing.title}>
                    {listing.title}
                </CardTitle>
                <CardDescription>
                    <span>{listing.type === 'buy' ? 'Looking to buy' : 'For sale'}</span>
                    {listing.price && <span> - {listing.price}</span>}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-2">
                {listing.images.length > 0 && (
                    <Carousel>
                        <CarouselContent>
                            {listing.images
                                .sort((a, b) => a.id - b.id)
                                .map((image) => (
                                    <CarouselItem key={image.id}>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <img className="w-full" loading="lazy" src={image.thumbnail_url} />
                                            </DialogTrigger>
                                            <DialogContent className="flex max-h-screen max-w-none items-center justify-center">
                                                <img className="max-h-screen p-4" loading="lazy" src={image.url} />
                                            </DialogContent>
                                        </Dialog>
                                    </CarouselItem>
                                ))}
                        </CarouselContent>
                        {listing.images.length > 1 && (
                            <>
                                <CarouselPrevious className="-left-4" />
                                <CarouselNext className="-right-4" />
                            </>
                        )}
                    </Carousel>
                )}
                <DiscordMarkdownField text={listing.description || ''} />
            </CardContent>
            <CardFooter className="flex flex-row-reverse justify-between">
                <Button asChild>
                    <a href={listing.url} target="_blank">
                        Open
                    </a>
                </Button>
                {listing.status !== 'closed' && (user.is_owner || user.id === listing.owner_id) && (
                    <EditListingDialog listing={listing} />
                )}
            </CardFooter>
        </Card>
    );
}

export default function ListingsRoute() {
    const [onlyMine, setOnlyMine] = useState(false);
    const [selectedStatuses, setSelectedStatuses] = useState<Record<ListingStatus, boolean>>({
        open: true,
        pending: true,
        closed: false,
    });

    const {
        user: { id: currentUserId },
    } = useStore();

    const { data: listings, isFetching } = useGetListings(
        {
            body: {
                statuses: Object.entries(selectedStatuses)
                    .filter(([_, enabled]) => enabled)
                    .map(([status, _]) => status as ListingStatus),
                owners: onlyMine ? [currentUserId] : null,
            },
        },
        { placeholderData: keepPreviousData },
    );

    return (
        <div>
            <header className="flex w-full flex-col items-center justify-between space-y-2 p-2 md:flex-row">
                <h1 className="content-center text-xl font-semibold">Shopkeeper</h1>
                <div className="flex space-x-2">
                    <ListingFiltersDialog
                        selectedStatuses={selectedStatuses}
                        setSelectedStatuses={setSelectedStatuses}
                        onlyMine={onlyMine}
                        setOnlyMine={setOnlyMine}
                    />
                    <CreateListingDialog />
                </div>
            </header>
            <div className="p-2">
                {isFetching && !listings ? (
                    <div className="flex w-full flex-row justify-center">
                        <div className="h-16 w-16 animate-spin rounded-full border-t-2 border-blue-500"></div>
                    </div>
                ) : listings && listings.length !== 0 ? (
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {listings.map((listing) => (
                            <ListingCard key={listing.id} listing={listing} />
                        ))}
                    </div>
                ) : (
                    <div className="flex justify-center italic text-muted-foreground">
                        No listings found - try checking your filters?
                    </div>
                )}
            </div>
        </div>
    );
}
