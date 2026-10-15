import { Button, CloseButton, Dialog, Portal, Stack } from '@chakra-ui/react'
import { ErrorNotice } from './Feedback'

export default function ConfirmDialog({
    title,
    description,
    pending,
    error,
    onClose,
    onConfirm,
    confirmLabel = 'Eliminar',
}) {
    return (
        <Dialog.Root
            role="alertdialog"
            open
            onOpenChange={({ open }) => {
                if (!open && !pending) onClose()
            }}
            closeOnEscape={!pending}
            closeOnInteractOutside={!pending}
            initialFocusEl={() => document.getElementById('cancel-operation')}
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content mx="4">
                        <Dialog.Header>
                            <Dialog.Title>{title}</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Stack gap="4">
                                <Dialog.Description>{description}</Dialog.Description>
                                <ErrorNotice error={error} />
                            </Stack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button
                                id="cancel-operation"
                                variant="outline"
                                disabled={pending}
                                onClick={onClose}
                            >
                                Volver
                            </Button>
                            <Button colorPalette="red" loading={pending} onClick={onConfirm}>
                                {confirmLabel}
                            </Button>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" disabled={pending} />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}
