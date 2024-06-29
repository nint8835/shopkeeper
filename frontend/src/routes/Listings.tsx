import { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGemoji from 'remark-gemoji';
import { useGetListings } from '../queries/api/shopkeeperComponents';
import { ListingSchema, ListingStatus } from '../queries/api/shopkeeperSchemas';

function DiscordMarkdownField({ text }: { text: string }) {
    return (
        <Markdown className="prose prose-zinc prose-invert" remarkPlugins={[remarkGemoji]}>
            {text}
        </Markdown>
    );
}

function ListingCard({ listing }: { listing: ListingSchema }) {
    return (
        <div className="flex flex-col justify-between rounded-md border-2 border-zinc-900 bg-zinc-900 p-2">
            <div>
                <h1 className="text-lg font-medium">{listing.title}</h1>
                <div>
                    <span>{listing.type === 'buy' ? 'Looking to buy' : 'For sale'}</span>
                    <DiscordMarkdownField text={listing.price || ''} />
                </div>
                <div>
                    <DiscordMarkdownField text={listing.description || ''} />
                </div>
            </div>

            <div className="flex flex-row-reverse">
                <a
                    className="cursor-pointer rounded-md bg-zinc-100 p-2 text-zinc-900 transition-colors hover:bg-zinc-300"
                    href={listing.url}
                    target="_blank"
                >
                    Open
                </a>
            </div>
        </div>
    );
}

export default function ListingsRoute() {
    const [status, setStatus] = useState<ListingStatus>('open');

    const { data: listings, isFetching } = useGetListings({ queryParams: { status } });

    return (
        <div className="p-2">
            <select
                className="mb-2 rounded-md bg-zinc-900 p-2"
                value={status}
                onChange={(e) => setStatus(e.target.value as ListingStatus)}
            >
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="closed">Closed</option>
            </select>

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
