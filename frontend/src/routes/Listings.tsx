import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { useGetListings } from '@/queries/api/shopkeeperComponents';
import { ListingSchema, ListingStatus } from '@/queries/api/shopkeeperSchemas';
import { SelectValue } from '@radix-ui/react-select';
import { SetStateAction, useState } from 'react';
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
            <CardFooter className="flex flex-row-reverse">
                <Button asChild>
                    <a href={listing.url} target="_blank">
                        Open
                    </a>
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function ListingsRoute() {
    const [status, setStatus] = useState<ListingStatus>('open');

    const { data: listings, isFetching } = useGetListings({ queryParams: { status } });

    return (
        <div className="p-2">
            <Select value={status} onValueChange={setStatus as React.Dispatch<SetStateAction<string>>}>
                <SelectTrigger className="mb-2 w-[180px]">
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
            </Select>

            {isFetching ? (
                <div className="flex w-full flex-row justify-center">
                    <div className="h-16 w-16 animate-spin rounded-full border-t-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {listings && listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
                </div>
            )}
        </div>
    );
}
