import EditListingDialog from '@/components/dialogs/EditListing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStore } from '@/lib/state';
import { useGetListings } from '@/queries/api/shopkeeperComponents';
import { ListingSchema, ListingStatus } from '@/queries/api/shopkeeperSchemas';
import Markdown from 'react-markdown';
import remarkGemoji from 'remark-gemoji';

function DiscordMarkdownField({ text }: { text: string }) {
    return (
        <Markdown className="prose prose-zinc prose-invert" remarkPlugins={[remarkGemoji]}>
            {text}
        </Markdown>
    );
}

function ListingCard({ listing }: { listing: ListingSchema }) {
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
            <CardContent className="flex-1">
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
    const { data: listings, isFetching } = useGetListings({ queryParams: { status } });

    return isFetching ? (
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
