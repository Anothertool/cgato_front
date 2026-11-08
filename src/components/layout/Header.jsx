import { Box, Flex, Heading } from '@chakra-ui/react'

export default function Header({ title, actionRef }) {
    return (
        <Flex
            as="header"
            minH="76px"
            py="4"
            px={{ base: '5', lg: '10' }}
            align="center"
            justify="space-between"
            bg="white"
            borderBottomWidth="1px"
            borderColor="gray.200"
            gap="4"
        >
            <Heading as="h1" size={{ base: 'xl', sm: '2xl' }} letterSpacing="-1px" minW="0">
                {title}
            </Heading>
            <Box ref={actionRef} flexShrink="0" ml="auto" />
        </Flex>
    )
}
