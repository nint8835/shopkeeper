import CreateListingDialog from '@/components/dialogs/CreateListing';
import EditListingDialog from '@/components/dialogs/EditListing';
import ListingFiltersDialog from '@/components/dialogs/Filters';
import { queryClient } from '@/lib/query';
import { defaultQueryParams, useStore } from '@/lib/state';
import { arraysEqual, cn, pluralize } from '@/lib/utils';
import {
    getListingsQuery,
    useGetUserIssueCount,
    useHideImage,
    useHideListing,
    useSuspenseGetListings,
} from '@/queries/api/shopkeeperComponents';
import type {
    FullListingSchema,
    ListingImageSchema,
    ListingIssueIcon,
    ListingIssueResolutionLocation,
} from '@/queries/api/shopkeeperSchemas';
import { listingStatusSchema, listingTypeSchema } from '@/queries/api/shopkeeperZod';
import {
    Button,
    Card,
    CardBody,
    CardFooter,
    CardHeader,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Tooltip,
    useDisclosure,
} from '@heroui/react';
import { keepPreviousData } from '@tanstack/react-query';
import { createFileRoute, stripSearchParams, useNavigate } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import useEmblaCarousel from 'embla-carousel-react';
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    CircleAlert,
    DollarSign,
    FilterX,
    Image,
    LucideProps,
    Text,
} from 'lucide-react';
import { Masonry, type RenderComponentProps } from 'masonic';
import React, { useCallback } from 'react';
import Markdown from 'react-markdown';
import remarkGemoji from 'remark-gemoji';
import remarkGfm from 'remark-gfm';
import { useWindowSize } from 'usehooks-ts';
import { z } from 'zod';

const searchSchema = z.object({
    status: z.array(listingStatusSchema).default(defaultQueryParams.status),
    type: z.array(listingTypeSchema).default(defaultQueryParams.type),
    owner: z.array(z.string()).optional(),
    has_issues: z.boolean().optional(),
});

export const Route = createFileRoute('/')({
    component: RouteComponent,
    validateSearch: zodValidator(searchSchema),
    search: {
        middlewares: [stripSearchParams(defaultQueryParams)],
    },
    loaderDeps: ({ search: { status, type, owner, has_issues } }) => ({ status, type, owner, has_issues }),
    loader: ({ deps: { status, type, owner, has_issues } }) =>
        queryClient.ensureQueryData(
            getListingsQuery({ body: { statuses: status, types: type, owners: owner, has_issues } }),
        ),
});

function DiscordMarkdownField({ text }: { text: string }) {
    return (
        <Markdown className="prose prose-zinc prose-invert" remarkPlugins={[remarkGemoji, remarkGfm]}>
            {text}
        </Markdown>
    );
}

const issueIcons: Record<ListingIssueIcon, React.FC<LucideProps>> = {
    'dollar-sign': DollarSign,
    image: Image,
    text: Text,
};

function ListingAlertDialog({
    listing,
    setEditDialogOpen,
}: {
    listing: FullListingSchema;
    setEditDialogOpen: (open: boolean) => void;
}) {
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

    const issueResolutionButtons: Record<ListingIssueResolutionLocation, React.FC> = {
        ui: () => (
            <Button
                onPress={() => {
                    onClose();
                    setEditDialogOpen(true);
                }}
            >
                Edit
            </Button>
        ),
        discord: () => (
            <Button as="a" href={listing.url} target="_blank">
                Open
            </Button>
        ),
    };

    return (
        <>
            <Tooltip content="This listing has issues. Click to view.">
                <button
                    className="absolute right-0 top-0 z-50 -translate-y-2 translate-x-2 rounded-full bg-red-800 bg-opacity-50 p-1 transition-colors hover:bg-red-700"
                    onClick={onOpen}
                >
                    <CircleAlert />
                </button>
            </Tooltip>

            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    <ModalHeader>Listing issues</ModalHeader>

                    <ModalBody>
                        {listing.issues.map((issue) => {
                            const IssueIcon = issueIcons[issue.icon];
                            const ResolutionButton = issueResolutionButtons[issue.resolution_location];

                            return (
                                <div key={issue.title} className="flex flex-row items-center space-x-2">
                                    <IssueIcon height="32px" width="32px" className="h-full" />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium">{issue.title}</div>
                                        <div className="text-muted-foreground text-sm">{issue.description}</div>
                                    </div>
                                    <ResolutionButton />
                                </div>
                            );
                        })}
                    </ModalBody>
                    <ModalFooter />
                </ModalContent>
            </Modal>
        </>
    );
}

function ListingImage({ image }: { image: ListingImageSchema }) {
    const { user } = useStore();
    const { isOpen, onOpenChange, onOpen } = useDisclosure();
    const { mutateAsync: hideImage, isPending: hideImagePending } = useHideImage();
    return (
        <div>
            <img
                className="w-full"
                width={image.width}
                height={image.height}
                loading="lazy"
                src={image.thumbnail_url}
                onClick={onOpen}
            />
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent className="flex max-h-screen max-w-none items-center justify-center">
                    <ModalBody>
                        <img className="max-h-screen p-4" loading="lazy" src={image.url} />
                        {user.is_owner && (
                            <Button
                                color="danger"
                                onPress={async () => {
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
                            </Button>
                        )}
                        <ModalFooter />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </div>
    );
}

function ListingImageCarousel({ images }: { images: ListingImageSchema[] }) {
    const [emblaRef, emblaApi] = useEmblaCarousel();
    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);
    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    return (
        <div className="embla space-y-2">
            <div className="embla__viewport" ref={emblaRef}>
                <div className="embla__container">
                    {images.map((image) => (
                        <div className="embla__slide" key={image.id}>
                            <ListingImage image={image} />
                        </div>
                    ))}
                </div>
            </div>
            {images.length > 1 && (
                <div className="flex w-full justify-center space-x-2">
                    <Button radius="full" className="embla__prev w-fit min-w-fit p-2" onPress={scrollPrev}>
                        <ArrowLeft />
                    </Button>
                    <Button radius="full" className="embla__next w-fit min-w-fit p-2" onPress={scrollNext}>
                        <ArrowRight />
                    </Button>
                </div>
            )}
        </div>
    );
}

function ListingCard({ data: listing }: RenderComponentProps<FullListingSchema>) {
    const { user } = useStore();
    const { mutateAsync: hideListing, isPending: hidePending } = useHideListing();
    const {
        isOpen: editDialogIsOpen,
        onOpenChange: editDialogOnOpenChange,
        onOpen: editDialogOnOpen,
        onClose: editDialogOnClose,
    } = useDisclosure();

    return (
        <>
            {listing.issues.length > 0 && listing.owner_id === user.id && (
                <ListingAlertDialog listing={listing} setEditDialogOpen={editDialogOnOpenChange} />
            )}
            <Card
                className={cn(
                    'flex flex-col',
                    listing.status !== 'open' && 'border-l-4',
                    { open: '', pending: 'border-l-yellow-400', closed: 'border-l-red-400' }[listing.status],
                )}
            >
                <CardHeader className="flex-col items-start">
                    <h3 className="w-full overflow-hidden text-ellipsis text-2xl font-bold" title={listing.title}>
                        {listing.title}
                    </h3>
                    <h4 className="text-muted-foreground text-sm">
                        <span>{listing.type === 'buy' ? 'Looking to buy' : 'For sale'}</span>
                        {listing.price && <span> - {listing.price}</span>}
                    </h4>
                </CardHeader>
                <CardBody className="flex-1 space-y-2">
                    {listing.images.length > 0 && <ListingImageCarousel images={listing.images} />}
                    <DiscordMarkdownField text={listing.description || ''} />
                </CardBody>
                <CardFooter className="flex flex-row-reverse justify-between">
                    <Button as="a" href={listing.url} target="_blank">
                        Open
                    </Button>
                    <div className="space-x-2">
                        {listing.status !== 'closed' && (user.is_owner || user.id === listing.owner_id) && (
                            <EditListingDialog
                                listing={listing}
                                isOpen={editDialogIsOpen}
                                onOpenChange={editDialogOnOpenChange}
                                onOpen={editDialogOnOpen}
                                onClose={editDialogOnClose}
                            />
                        )}
                        {user.is_owner && (
                            <Button
                                color="danger"
                                onPress={async () => {
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
        </>
    );
}

function RouteComponent() {
    const filters = Route.useSearch();
    const navigate = useNavigate({ from: Route.fullPath });

    function setSearchParams(params: Partial<z.infer<typeof searchSchema>>) {
        navigate({ search: params });
    }

    const filteredStatuses = filters.status;
    const statusFilterSet = !arraysEqual(filteredStatuses, defaultQueryParams.status);

    const filteredOwners = filters.owner;
    const ownerFilterSet = filteredOwners && filteredOwners.length > 0;

    const filteredTypes = filters.type;
    const typeFilterSet = !arraysEqual(filteredTypes, defaultQueryParams.type);

    const filterHasIssues = filters.has_issues;
    const hasIssuesFilterSet = filterHasIssues !== undefined;

    const filtersActive = statusFilterSet || ownerFilterSet || typeFilterSet || hasIssuesFilterSet;

    const { width: windowWidth } = useWindowSize();
    const { data: listings } = useSuspenseGetListings(
        {
            body: {
                statuses: filteredStatuses,
                owners: filteredOwners,
                types: filteredTypes,
                has_issues: filterHasIssues,
            },
        },
        { placeholderData: keepPreviousData },
    );
    const { data: issueCount } = useGetUserIssueCount({});
    const currentUserId = useStore((state) => state.user?.id);

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
                <div className="flex flex-col gap-2 md:flex-row">
                    {issueCount && issueCount > 0 ? (
                        <Button
                            color="danger"
                            className="space-x-2"
                            onPress={() => {
                                setSearchParams({
                                    has_issues: true,
                                    owner: [currentUserId],
                                    status: defaultQueryParams.status,
                                    type: defaultQueryParams.type,
                                });
                            }}
                        >
                            <AlertCircle />
                            <span>
                                {issueCount} {pluralize(issueCount || 0, 'listing has', 'listings have')} issues
                            </span>
                        </Button>
                    ) : null}
                    {filtersActive && (
                        <Button
                            variant="faded"
                            className="space-x-2"
                            onPress={() => {
                                setSearchParams({});
                            }}
                        >
                            <FilterX />
                            <span>Reset filters</span>
                        </Button>
                    )}
                    <div className="space-x-2">
                        <ListingFiltersDialog />
                        <CreateListingDialog />
                    </div>
                </div>
            </header>
            <div className="p-2">
                {listings.length !== 0 ? (
                    <Masonry
                        items={listings}
                        render={ListingCard}
                        columnGutter={8}
                        columnCount={columnCount}
                        itemKey={({ id }) => id}
                        key={listings.length}
                    />
                ) : (
                    <div className="text-muted-foreground flex justify-center italic">
                        No listings found - try checking your filters?
                    </div>
                )}
            </div>
        </div>
    );
}
