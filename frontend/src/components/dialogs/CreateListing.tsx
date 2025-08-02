import { queryClient } from '@/lib/query';
import { useCreateListing } from '@/queries/api/shopkeeperComponents';
import { ListingType } from '@/queries/api/shopkeeperSchemas';
import { createListingSchemaSchema } from '@/queries/api/shopkeeperZod';
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
    useDisclosure,
} from '@heroui/react';
import { useForm } from '@tanstack/react-form';
import { Plus } from 'lucide-react';
import { z } from 'zod';

export default function CreateListingDialog() {
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

    const { mutateAsync: createListing, isPending: mutationPending } = useCreateListing();

    async function handleSubmit(value: z.infer<typeof createListingSchemaSchema>) {
        try {
            const newListing = await createListing({ body: value });
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
            tsForm.setErrorMap({
                onSubmit: {
                    fields: {},
                    form: (e as Error).message || 'An unexpected error occurred',
                },
            });
        }
    }

    const tsForm = useForm({
        defaultValues: {
            title: '',
            type: 'sell' as ListingType,
            description: '',
            price: '',
        },
        onSubmit: ({ value }) => handleSubmit(value),
        validators: {
            onChange: createListingSchemaSchema,
        },
    });

    function handleOpenChange(open: boolean) {
        tsForm.reset();
        if (!open) {
            onClose();
        } else {
            onOpen();
        }
    }

    return (
        <>
            <Button variant="bordered" onPress={onOpen}>
                <Plus className="mr-2 h-4 w-4" /> Create Listing
            </Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    <Form
                        onSubmit={(e) => {
                            e.preventDefault();
                            tsForm.handleSubmit();
                        }}
                    >
                        <ModalHeader>Create Listing</ModalHeader>

                        <ModalBody className="w-full">
                            <tsForm.Field
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

                            <tsForm.Field
                                name="type"
                                children={(field) => (
                                    <Select
                                        name={field.name}
                                        isRequired
                                        label="Type"
                                        selectedKeys={[field.state.value]}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value as ListingType)}
                                        validationBehavior="aria"
                                        errorMessage={field.state.meta.errors
                                            .filter((e) => e !== undefined)
                                            .map((e) => e.message)
                                            .join(', ')}
                                        isInvalid={!field.state.meta.isValid}
                                    >
                                        <SelectItem key="sell">For sale</SelectItem>
                                        <SelectItem key="buy">Looking to buy</SelectItem>
                                    </Select>
                                )}
                            />

                            <tsForm.Field
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

                            <tsForm.Field
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

                            <tsForm.Subscribe
                                selector={(state) => state.errors}
                                children={(errors) => errors.length > 0 && <Alert color="danger">{errors}</Alert>}
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
