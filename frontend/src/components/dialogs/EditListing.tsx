import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    RootFormMessage,
} from '@/components/ui/form';
import { queryClient } from '@/lib/query';
import { useEditListing } from '@/queries/api/shopkeeperComponents';
import { ListingSchema } from '@/queries/api/shopkeeperSchemas';
import { editListingSchemaSchema } from '@/queries/api/shopkeeperZod';
import {
    addToast,
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
    Textarea,
} from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export default function EditListingDialog({
    listing,
    isOpen,
    onOpen,
    onOpenChange,
}: {
    listing: ListingSchema;
    isOpen: boolean;
    onOpen: () => void;
    onOpenChange: (open: boolean) => void;
}) {
    const form = useForm<z.infer<typeof editListingSchemaSchema>>({
        resolver: zodResolver(editListingSchemaSchema),
        defaultValues: {
            title: listing.title,
            description: listing.description || '',
            price: listing.price || '',
            status: listing.status,
        },
    });

    const { mutateAsync: editListing, isPending: mutationPending } = useEditListing();

    function handleOpenChange(open: boolean) {
        form.reset({
            title: listing.title,
            description: listing.description || '',
            price: listing.price || '',
            status: listing.status,
        });
        onOpenChange(open);
    }

    async function handleSubmit() {
        try {
            const newListing = await editListing({ pathParams: { listingId: listing.id }, body: form.getValues() });
            addToast({
                title: 'Listing edited successfully',
                endContent: (
                    <Button as="a" target="_blank" href={newListing.url}>
                        Open
                    </Button>
                ),
            });
            queryClient.invalidateQueries({ queryKey: ['api', 'listings'] });
            handleOpenChange(false);
        } catch (e) {
            form.setError('root', { message: (e as Error).message || 'An unexpected error occurred' });
        }
    }

    return (
        <>
            <Button variant="faded" onPress={onOpen}>
                Edit
            </Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    <Form {...form}>
                        <ModalHeader>Edit Listing</ModalHeader>

                        <form onSubmit={form.handleSubmit(handleSubmit)}>
                            <ModalBody>
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                Supports Discord-flavoured Markdown. Leave blank for no description.
                                            </FormDescription>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormDescription>Leave blank for no price.</FormDescription>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status</FormLabel>
                                            <FormControl>
                                                <Select onChange={field.onChange} selectedKeys={[field.value]}>
                                                    <SelectItem key="open">Open</SelectItem>
                                                    <SelectItem key="pending">Pending</SelectItem>
                                                    <SelectItem key="closed">Closed</SelectItem>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <RootFormMessage />
                            </ModalBody>

                            <ModalFooter>
                                <Button type="submit" disabled={mutationPending}>
                                    Submit
                                </Button>
                            </ModalFooter>
                        </form>
                    </Form>
                </ModalContent>
            </Modal>
        </>
    );
}
