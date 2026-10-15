import { createToaster, Portal, Spinner, Stack, Toast, Toaster } from '@chakra-ui/react'

export const toaster = createToaster({
    placement: 'top-end',
    pauseOnPageIdle: true,
})

export default function Notifications() {
    return (
        <Portal>
            <Toaster toaster={toaster}>
                {(toast) => (
                    <Toast.Root width={{ base: '90vw', md: '380px' }}>
                        {toast.type === 'loading' ? <Spinner size="sm" /> : <Toast.Indicator />}
                        <Stack gap="1" flex="1">
                            <Toast.Title>{toast.title}</Toast.Title>
                            {toast.description && (
                                <Toast.Description>{toast.description}</Toast.Description>
                            )}
                        </Stack>
                        <Toast.CloseTrigger />
                    </Toast.Root>
                )}
            </Toaster>
        </Portal>
    )
}
