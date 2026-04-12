import { Box, Flex, Text, Icon } from '@chakra-ui/react'

export default function StatCard({ title, value, subtitle, icon, gradient }) {
  return (
    <Box
      bg="navy.700" borderRadius="2xl" p={6}
      boxShadow="0px 18px 40px rgba(112,144,176,0.10)"
      border="1px solid" borderColor="whiteAlpha.100"
      transition="transform 0.2s" _hover={{ transform: 'translateY(-4px)' }}
    >
      <Flex justify="space-between" align="flex-start">
        <Box>
          <Text fontSize="xs" color="whiteAlpha.500" fontWeight="700" textTransform="uppercase" letterSpacing="wider" mb={1}>{title}</Text>
          <Text fontSize="2xl" fontWeight="900" color="white" lineHeight="1">{value}</Text>
          {subtitle && <Text fontSize="xs" color="whiteAlpha.500" mt={1}>{subtitle}</Text>}
        </Box>
        <Flex
          w={12} h={12} borderRadius="xl" align="center" justify="center" flexShrink={0}
          bg={gradient || 'linear-gradient(97.89deg,#4fd1c5 17.73%,#2b6cb0 100%)'}
          boxShadow="0 4px 20px rgba(79,209,197,0.3)"
        >
          <Icon as={icon} boxSize={6} color="white" />
        </Flex>
      </Flex>
    </Box>
  )
}
