import { Box, Flex, Heading, Text } from '@chakra-ui/react'
import { ChevronRight } from 'lucide-react'

export default function Header({ title, actionRef, showBreadcrumbs = true }) {
    return (
        <Flex
            as="header"
            minH={showBreadcrumbs ? '112px' : '76px'}
            py="4"
            px={{ base: '5', lg: '10' }}
            align="center"
            justify="space-between"
            bg="white"
            borderBottomWidth="1px"
            borderColor="gray.200"
            gap="4"
        >
            <Box minW="0">
                {showBreadcrumbs && (
                    <Flex
                        gap={{ base: '2', sm: '3' }}
                        align="center"
                        fontSize={{ base: 'xs', sm: 'sm' }}
                        as="nav"
                        aria-label="Ruta de navegación"
                    >
                        <Text color="gray.400">Clínica</Text>
                        <Box color="gray.300">
                            <ChevronRight size={14} />
                        </Box>
                        <Text fontWeight="medium" aria-current="page">
                            {title}
                        </Text>
                    </Flex>
                )}
                <Heading
                    size={{ base: 'xl', sm: '2xl' }}
                    letterSpacing="-1px"
                    mt={showBreadcrumbs ? '2' : '0'}
                >
                    {title}
                </Heading>
            </Box>
            <Box ref={actionRef} flexShrink="0" ml="auto" />
        </Flex>
    )
}
