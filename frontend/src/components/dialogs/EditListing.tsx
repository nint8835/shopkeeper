import { queryClient } from '@/lib/query';
import { useEditListing } from '@/queries/api/shopkeeperComponents';
import { ListingSchema, ListingStatus } from '@/queries/api/shopkeeperSchemas';
import { editListingSchemaSchema } from '@/queries/api/shopkeeperZod';
import {
    addToast,
    Alert,
    Button,
    Form,
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
import { useForm } from '@tanstack/react-form';
import z from 'zod';

export default function EditListingDialog({
    listing,
    isOpen,
    onOpen,
    onClose,
    onOpenChange,
}: {
    listing: ListingSchema;
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    onOpenChange: () => void;
}) {
    const form = useForm({
        defaultValues: {
            title: listing.title,
            description: listing.description || '',
            price: listing.price || '',
            status: listing.status,
        },
        onSubmit: ({ value }) => handleSubmit(value),
        validators: {
            onChange: editListingSchemaSchema,
        },
    });

    const { mutateAsync: editListing, isPending: mutationPending } = useEditListing();

    function handleOpenChange(open: boolean) {
        form.reset();
        if (!open) {
            onClose();
        } else {
            onOpen();
        }
    }

    async function handleSubmit(value: z.infer<typeof editListingSchemaSchema>) {
        try {
            const newListing = await editListing({ pathParams: { listingId: listing.id }, body: value });
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
            form.setErrorMap({
                onSubmit: {
                    fields: {},
                    form: (e as Error).message || 'An unexpected error occurred',
                },
            });
        }
    }

    return (
        <>
            <Button variant="faded" onPress={onOpen}>
                Edit
            </Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    <Form
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.handleSubmit();
                        }}
                    >
                        <ModalHeader>Edit Listing</ModalHeader>

                        <ModalBody className="w-full">
                            <form.Field
                                name="title"
                                children={(field) => (
                                    <Input
                                        name={field.name}
                                        isRequired
                                        label="Title"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        validationBehavior="aria"
                                        errorMessage={field.state.meta.errors
                                            .filter((e) => e !== undefined)
                                            .map((e) => e.message)
                                            .join(', ')}
                                        isInvalid={!field.state.meta.isValid}
                                    />
                                )}
                            />

                            <form.Field
                                name="description"
                                children={(field) => (
                                    <Textarea
                                        name={field.name}
                                        label="Description"
                                        description="Supports Discord-flavoured Markdown. Leave blank for no description."
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        validationBehavior="aria"
                                        errorMessage={field.state.meta.errors
                                            .filter((e) => e !== undefined)
                                            .map((e) => e.message)
                                            .join(', ')}
                                        isInvalid={!field.state.meta.isValid}
                                    />
                                )}
                            />

                            <form.Field
                                name="price"
                                children={(field) => (
                                    <Input
                                        name={field.name}
                                        label="Price"
                                        description="Leave blank for no price."
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        validationBehavior="aria"
                                        errorMessage={field.state.meta.errors
                                            .filter((e) => e !== undefined)
                                            .map((e) => e.message)
                                            .join(', ')}
                                        isInvalid={!field.state.meta.isValid}
                                    />
                                )}
                            />

                            <form.Field
                                name="status"
                                children={(field) => (
                                    <Select
                                        name={field.name}
                                        isRequired
                                        label="Status"
                                        selectedKeys={[field.state.value]}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value as ListingStatus)}
                                        validationBehavior="aria"
                                        errorMessage={field.state.meta.errors
                                            .filter((e) => e !== undefined)
                                            .map((e) => e.message)
                                            .join(', ')}
                                        isInvalid={!field.state.meta.isValid}
                                    >
                                        <SelectItem key="open">Active</SelectItem>
                                        <SelectItem key="pending">Pending</SelectItem>
                                        <SelectItem key="closed">Closed</SelectItem>
                                    </Select>
                                )}
                            />

                            <form.Subscribe
                                selector={(state) => state.errors}
                                children={(errors) =>
                                    errors.length > 0 && <Alert color="danger">{errors as unknown as string}</Alert>
                                }
                            />
                        </ModalBody>

                        <ModalFooter className="w-full items-end">
                            <Button type="submit" disabled={mutationPending}>
                                Submit
                            </Button>
                        </ModalFooter>
                    </Form>
                </ModalContent>
            </Modal>
        </>
    );
}
