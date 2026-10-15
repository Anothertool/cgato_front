import { Button, CloseButton, Drawer, Portal } from '@chakra-ui/react'

export default function FormDrawer({
    title,
    description,
    onClose,
    onSubmit,
    pending,
    wide,
    children,
}) {
    return (
        <Drawer.Root
            open
            onOpenChange={({ open }) => {
                if (!open && !pending) onClose()
            }}
            size={wide ? 'lg' : 'md'}
            closeOnEscape={!pending}
            closeOnInteractOutside={!pending}
        >
            <Portal>
                <Drawer.Backdrop />
                <Drawer.Positioner>
                    <Drawer.Content as="form" onSubmit={onSubmit} bg="white" color="gray.800">
                        <Drawer.Header borderBottomWidth="1px" py="6">
                            <Drawer.Title fontSize="xl">{title}</Drawer.Title>
                            <Drawer.Description mt="1">{description}</Drawer.Description>
                        </Drawer.Header>
                        <Drawer.Body py="6">{children}</Drawer.Body>
                        <Drawer.Footer borderTopWidth="1px">
                            <Button variant="outline" onClick={onClose} disabled={pending}>
                                Cancelar
                            </Button>
                            <Button type="submit" bg="blue.900" color="white" loading={pending}>
                                Guardar cambios
                            </Button>
                        </Drawer.Footer>
                        <Drawer.CloseTrigger asChild>
                            <CloseButton size="sm" disabled={pending} />
                        </Drawer.CloseTrigger>
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    )
}
