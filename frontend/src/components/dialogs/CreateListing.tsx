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
import { useCreateListing } from '@/queries/api/shopkeeperComponents';
import { createListingSchemaSchema } from '@/queries/api/shopkeeperZod';
import { addToast, Button } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogTitle } from '@radix-ui/react-dialog';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export default function CreateListingDialog() {
    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof createListingSchemaSchema>>({
        resolver: zodResolver(createListingSchemaSchema),
        defaultValues: {
            title: '',
            type: 'sell',
            description: '',
            price: '',
        },
    });

    const { mutateAsync: createListing, isPending: mutationPending } = useCreateListing();

    function handleOpenChange(open: boolean) {
        form.reset({ title: '', type: 'sell', description: '', price: '' });
        setOpen(open);
    }

    async function handleSubmit() {
        try {
            const newListing = await createListing({ body: form.getValues() });
            addToast({
                title: 'Listing created successfully',
                endContent: (
                    <Button
                        onClick={() => {
                            window.open(newListing.url);
                        }}
                    >
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
                <Button variant="bordered">
                    <Plus className="mr-2 h-4 w-4" /> Create Listing
                </Button>
            </DialogTrigger>
            <DialogContent>
                <Form {...form}>
                    <DialogHeader>
                        <DialogTitle>Create Listing</DialogTitle>
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
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>

                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="sell">For sale</SelectItem>
                                            <SelectItem value="buy">Looking to buy</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <FormMessage />
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
