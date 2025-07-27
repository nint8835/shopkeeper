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
import { queryClient } from '@/lib/query';
import { useCreateListing } from '@/queries/api/shopkeeperComponents';
import { createListingSchemaSchema } from '@/queries/api/shopkeeperZod';
import {
    addToast,
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Textarea,
    useDisclosure,
} from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export default function CreateListingDialog() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

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
        if (open !== isOpen) {
            onOpen();
        }
    }

    async function handleSubmit() {
        try {
            const newListing = await createListing({ body: form.getValues() });
            addToast({
                title: 'Listing created successfully',
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
            <Button variant="bordered" onPress={onOpen}>
                <Plus className="mr-2 h-4 w-4" /> Create Listing
            </Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)}>
                            <ModalHeader>Create Listing</ModalHeader>
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
