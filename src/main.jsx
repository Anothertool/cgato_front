import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import Notifications from './components/ui/toaster'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: { refetchOnWindowFocus: false },
        mutations: { retry: false },
    },
})

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ChakraProvider value={defaultSystem}>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
                <Notifications />
            </QueryClientProvider>
        </ChakraProvider>
    </StrictMode>,
)
