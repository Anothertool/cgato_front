import { useRef, useState } from 'react'
import { Button, Flex, IconButton, Popover, Portal, Stack } from '@chakra-ui/react'
import { Trash2 } from 'lucide-react'
import { ErrorNotice } from '../ui/Feedback'

export default function PopoverDelete({
    onConfirm,
    pending = false,
    disabled = false,
    error,
    label = 'Eliminar',
    title = 'Eliminar registro',
    description = '¿Seguro que quieres eliminar este registro?',
}) {
    const [open, setOpen] = useState(false)
    const cancelRef = useRef(null)

    const handleConfirm = async () => {
        if (pending || disabled) return
        try {
            await onConfirm()
            setOpen(false)
        } catch {
            return
        }
    }

    return (
        <Popover.Root
            open={open}
            onOpenChange={({ open }) => {
                if (!pending) setOpen(open)
            }}
            closeOnEscape={!pending}
            closeOnInteractOutside={!pending}
            initialFocusEl={() => cancelRef.current}
        >
            <Popover.Trigger asChild>
                <IconButton
                    type="button"
                    aria-label={label}
                    size="xs"
                    variant="ghost"
                    colorPalette="red"
                    disabled={disabled || pending}
                >
                    <Trash2 size={15} aria-hidden="true" />
                </IconButton>
            </Popover.Trigger>
            <Portal>
                <Popover.Positioner>
                    <Popover.Content width="280px" maxW="calc(100vw - 32px)">
                        <Popover.Arrow />
                        <Popover.Body>
                            <Stack gap="3">
                                <Popover.Title fontWeight="semibold">{title}</Popover.Title>
                                <Popover.Description fontSize="sm">{description}</Popover.Description>
                                <ErrorNotice error={error} />
                                <Flex justify="flex-end" gap="2">
                                    <Button
                                        ref={cancelRef}
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        disabled={pending}
                                        onClick={() => setOpen(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        colorPalette="red"
                                        loading={pending}
                                        disabled={disabled || pending}
                                        onClick={handleConfirm}
                                    >
                                        Eliminar
                                    </Button>
                                </Flex>
                            </Stack>
                        </Popover.Body>
                    </Popover.Content>
                </Popover.Positioner>
            </Portal>
        </Popover.Root>
    )
}
