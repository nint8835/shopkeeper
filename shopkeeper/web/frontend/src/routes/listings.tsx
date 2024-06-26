import { useGetListings } from '../queries/api/shopkeeperComponents';

export default function ListingsRoute() {
    const { data: listings } = useGetListings({});

    return (
        <div className="p-2">
            <ul>
                {listings &&
                    listings.map((listing) => (
                        <li className="list-inside list-disc" key={listing.id}>
                            <a className="cursor-pointer hover:underline" href={listing.url}>
                                {listing.title}
                            </a>
                        </li>
                    ))}
            </ul>
        </div>
    );
}
