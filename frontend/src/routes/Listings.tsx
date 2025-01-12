import CreateListingDialog from '@/components/dialogs/CreateListing';
import EditListingDialog from '@/components/dialogs/EditListing';
import ListingFiltersDialog from '@/components/dialogs/Filters';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { queryClient } from '@/lib/query';
import { useStore } from '@/lib/state';
import { cn } from '@/lib/utils';
import { useGetListings, useHideImage, useHideListing } from '@/queries/api/shopkeeperComponents';
import type { FullListingSchema, ListingStatus, ListingType } from '@/queries/api/shopkeeperSchemas';
import { keepPreviousData } from '@tanstack/react-query';
import { CircleAlert } from 'lucide-react';
import { Masonry, type RenderComponentProps } from 'masonic';
import Markdown from 'react-markdown';
import { useSearchParams } from 'react-router-dom';
import remarkGemoji from 'remark-gemoji';
import { useWindowSize } from 'usehooks-ts';

function DiscordMarkdownField({ text }: { text: string }) {
    return (
        <Markdown className="prose prose-zinc prose-invert" remarkPlugins={[remarkGemoji]}>
            {text}
        </Markdown>
    );
}

function ListingAlertDialog({ listing }: { listing: FullListingSchema }) {
    return (
        <Dialog>
            <DialogTrigger>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button className="absolute right-0 top-0 -translate-y-2 translate-x-2 rounded-full bg-red-800 bg-opacity-50 p-1 transition-colors hover:bg-red-700">
                                <CircleAlert />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>This listing has issues. Click to view.</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Listing Issues</DialogTitle>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
}

function ListingCard({ data: listing }: RenderComponentProps<FullListingSchema>) {
    const { user } = useStore();
    const { mutateAsync: hideListing, isPending: hidePending } = useHideListing();
    const { mutateAsync: hideImage, isPending: hideImagePending } = useHideImage();

    return (
        <Card
            className={cn(
                'flex flex-col',
                listing.status !== 'open' && 'border-l-4',
                { open: '', pending: 'border-l-yellow-400', closed: 'border-l-red-400' }[listing.status],
            )}
        >
            {listing.issues.length > 0 && listing.owner_id === user.id && <ListingAlertDialog listing={listing} />}
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
                                                <img
                                                    className="w-full"
                                                    width={image.width}
                                                    height={image.height}
                                                    loading="lazy"
                                                    src={image.thumbnail_url}
                                                />
                                            </DialogTrigger>
                                            <DialogContent className="flex max-h-screen max-w-none items-center justify-center">
                                                <ContextMenu>
                                                    <ContextMenuTrigger>
                                                        <img
                                                            className="max-h-screen p-4"
                                                            loading="lazy"
                                                            src={image.url}
                                                        />
                                                    </ContextMenuTrigger>
                                                    <ContextMenuContent>
                                                        {user.is_owner && (
                                                            <ContextMenuItem
                                                                onClick={async () => {
                                                                    await hideImage({
                                                                        pathParams: { imageId: image.id },
                                                                    });
                                                                    queryClient.invalidateQueries({
                                                                        queryKey: ['api', 'listings'],
                                                                    });
                                                                }}
                                                                disabled={hideImagePending}
                                                            >
                                                                Hide
                                                            </ContextMenuItem>
                                                        )}
                                                    </ContextMenuContent>
                                                </ContextMenu>
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
                <div className="space-x-2">
                    {listing.status !== 'closed' && (user.is_owner || user.id === listing.owner_id) && (
                        <EditListingDialog listing={listing} />
                    )}
                    {user.is_owner && (
                        <Button
                            variant="destructive"
                            onClick={async () => {
                                await hideListing({ pathParams: { listingId: listing.id } });
                                queryClient.invalidateQueries({ queryKey: ['api', 'listings'] });
                            }}
                            disabled={hidePending}
                        >
                            Hide
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}

export default function ListingsRoute() {
    const [searchParams] = useSearchParams({ status: ['open', 'pending'], type: ['buy', 'sell'] });
    const filteredStatuses = searchParams.getAll('status') as ListingStatus[];
    const filteredOwners = searchParams.getAll('owner');
    const filteredTypes = searchParams.getAll('type') as ListingType[];

    const { width: windowWidth } = useWindowSize();

    const { data: listings, isFetching } = useGetListings(
        {
            body: {
                statuses: filteredStatuses,
                owners: filteredOwners.length > 0 ? filteredOwners : null,
                types: filteredTypes,
            },
        },
        { placeholderData: keepPreviousData },
    );

    let columnCount;
    if (windowWidth < 768) {
        columnCount = 1;
    } else if (windowWidth < 1024) {
        columnCount = 2;
    } else if (windowWidth < 1280) {
        columnCount = 3;
    } else {
        columnCount = 4;
    }

    return (
        <div>
            <header className="flex w-full flex-col items-center justify-between space-y-2 p-2 md:flex-row">
                <h1 className="content-center text-xl font-semibold">Shopkeeper</h1>
                <div className="flex space-x-2">
                    <ListingFiltersDialog />
                    <CreateListingDialog />
                </div>
            </header>
            <div className="p-2">
                {isFetching && !listings ? (
                    <div className="flex w-full flex-row justify-center">
                        <div className="h-16 w-16 animate-spin rounded-full border-t-2 border-blue-500"></div>
                    </div>
                ) : listings && listings.length !== 0 ? (
                    <Masonry
                        items={listings}
                        render={ListingCard}
                        columnGutter={8}
                        columnCount={columnCount}
                        itemKey={({ id }) => id}
                        key={listings.length}
                    />
                ) : (
                    <div className="flex justify-center italic text-muted-foreground">
                        No listings found - try checking your filters?
                    </div>
                )}
            </div>
        </div>
    );
}
