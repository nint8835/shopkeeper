import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { queryClient } from '@/lib/query';
import { useEditListing } from '@/queries/api/shopkeeperComponents';
import { ListingSchema } from '@/queries/api/shopkeeperSchemas';
import { editListingSchemaSchema } from '@/queries/api/shopkeeperZod';
import { addToast, Button } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogTitle } from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export default function EditListingDialog({
    listing,
    open,
    setOpen,
}: {
    listing: ListingSchema;
    open: boolean;
    setOpen: (open: boolean) => void;
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
        setOpen(open);
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
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="faded">Edit</Button>
            </DialogTrigger>
            <DialogContent>
                <Form {...form}>
                    <DialogHeader>
                        <DialogTitle>Edit Listing</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
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

                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="open">Open</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="closed">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <RootFormMessage />

                        <DialogFooter>
                            <Button type="submit" disabled={mutationPending}>
                                Submit
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
