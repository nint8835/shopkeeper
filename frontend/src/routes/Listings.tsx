import EditListingDialog from '@/components/dialogs/EditListing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStore } from '@/lib/state';
import { useGetListings } from '@/queries/api/shopkeeperComponents';
import { FullListingSchema, ListingStatus } from '@/queries/api/shopkeeperSchemas';
import { keepPreviousData } from '@tanstack/react-query';
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
        <Card className="flex flex-col">
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
                            {listing.images.map((image) => (
                                <CarouselItem key={image.id}>
                                    <Dialog>
                                        <DialogTrigger>
                                            <img loading="lazy" src={image.url} />
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

function ListingsTab({ status }: { status: ListingStatus }) {
    const { data: listings, isFetching } = useGetListings(
        { queryParams: { status } },
        { placeholderData: keepPreviousData },
    );

    return isFetching && !listings ? (
        <div className="flex w-full flex-row justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-t-2 border-blue-500"></div>
        </div>
    ) : (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings && listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
        </div>
    );
}

const LISTING_STATUSES = ['open', 'pending', 'closed'] as const;

export default function ListingsRoute() {
    return (
        <div className="p-2">
            <Tabs defaultValue="open">
                <TabsList className="grid w-full grid-cols-3">
                    {LISTING_STATUSES.map((status) => (
                        <TabsTrigger key={status} value={status} className="capitalize">
                            {status}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {LISTING_STATUSES.map((status) => (
                    <TabsContent key={status} value={status}>
                        <ListingsTab status={status} />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
