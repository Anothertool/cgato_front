import { Container, Heading, Stack, Text } from '@chakra-ui/react'

export default function App() {
  return (
    <Container maxW="3xl" py={{ base: '12', md: '24' }}>
      <Stack gap="4">
        <Heading size="3xl">CGato</Heading>
        <Text color="fg.muted">
          Frontend preparado con React, Vite y Chakra UI.
        </Text>
      </Stack>
    </Container>
  )
}
