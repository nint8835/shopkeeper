import { useGetListings } from '../queries/api/shopkeeperComponents';

export default function ListingsRoute() {
    const { data: listings } = useGetListings({});

    return (
        <div className="p-2">
            <ul>
                {listings &&
                    listings.map((listing) => (
                        <li className="list-inside list-disc" key={listing.id}>
                            {listing.title}
                        </li>
                    ))}
            </ul>
        </div>
    );
}
