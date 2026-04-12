import { Box, Flex, Text, VStack, HStack, Icon, Button } from '@chakra-ui/react'
import { NavLink, useNavigate } from 'react-router-dom'
import { MdDashboard, MdBusiness, MdShoppingCart, MdPeople, MdLogout, MdHelp } from 'react-icons/md'
import { useAuth } from '../contexts/AuthContext.jsx'

const NAV = [
  { label: 'Dashboard', icon: MdDashboard, to: '/', end: true },
  { label: 'Obras', icon: MdBusiness, to: '/obras' },
  { label: 'Compras', icon: MdShoppingCart, to: '/compras' },
]
const ACCOUNT = [
  { label: 'Usuários', icon: MdPeople, to: '/usuarios', adminOnly: true },
]

function NavItem({ label, icon, to, end, user, adminOnly }) {
  if (adminOnly && !user?.is_admin) return null
  return (
    <NavLink to={to} end={end}>
      {({ isActive }) => (
        <HStack
          w="full" px={4} py="10px" borderRadius="xl" spacing={3} cursor="pointer" transition="all 0.2s"
          bg={isActive ? 'whiteAlpha.200' : 'transparent'}
          _hover={{ bg: 'whiteAlpha.100' }}
        >
          <Flex
            w={8} h={8} borderRadius="lg" align="center" justify="center" flexShrink={0}
            bg={isActive ? 'linear-gradient(97.89deg,#4fd1c5 17.73%,#2b6cb0 100%)' : 'whiteAlpha.100'}
            boxShadow={isActive ? '0 4px 14px rgba(79,209,197,0.35)' : 'none'}
          >
            <Icon as={icon} color="white" boxSize={4} />
          </Flex>
          <Text fontSize="sm" fontWeight={isActive ? '600' : '400'} color={isActive ? 'white' : 'whiteAlpha.700'}>
            {label}
          </Text>
        </HStack>
      )}
    </NavLink>
  )
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const initial = (user?.first_name?.[0] || user?.username?.[0] || '?').toUpperCase()

  const handleLogout = async () => { await logout(); navigate('/login') }

  return (
    <Flex
      direction="column" h="100vh" bg="navy.700" px={4} py={6} overflowY="auto"
      boxShadow="14px 17px 40px 4px rgba(112,144,176,0.08)"
      borderRight="1px solid" borderColor="whiteAlpha.100"
    >
      {/* Logo */}
      <Box px={4} mb={8}>
        <Text fontSize="xs" fontWeight="700" color="brand.300" textTransform="uppercase" letterSpacing="widest">Obra</Text>
        <Text fontSize="xl" fontWeight="900" color="white" letterSpacing="-0.5px">Control</Text>
      </Box>

      {/* Main Nav */}
      <VStack spacing={1} align="stretch">
        {NAV.map(n => <NavItem key={n.to} {...n} user={user} />)}

        <Box px={4} pt={6} pb={2}>
          <Text fontSize="10px" fontWeight="700" color="whiteAlpha.400" textTransform="uppercase" letterSpacing="widest">Conta</Text>
        </Box>
        {ACCOUNT.map(n => <NavItem key={n.to} {...n} user={user} />)}

        <HStack
          w="full" px={4} py="10px" borderRadius="xl" spacing={3} cursor="pointer"
          transition="all 0.2s" _hover={{ bg: 'whiteAlpha.100' }} onClick={handleLogout} mt={1}
        >
          <Flex w={8} h={8} borderRadius="lg" bg="whiteAlpha.100" align="center" justify="center" flexShrink={0}>
            <Icon as={MdLogout} color="white" boxSize={4} />
          </Flex>
          <Text fontSize="sm" color="whiteAlpha.700">Sair</Text>
        </HStack>
      </VStack>

      {/* Help Card */}
      <Box
        mt="auto" pt={4} mb={4} p={5} borderRadius="2xl"
        bg="linear-gradient(135deg,#38b2ac 0%,#2b6cb0 100%)"
        boxShadow="0 8px 26px rgba(43,108,176,0.4)"
      >
        <Flex w={10} h={10} borderRadius="xl" bg="whiteAlpha.300" align="center" justify="center" mb={3}>
          <Icon as={MdHelp} color="white" boxSize={5} />
        </Flex>
        <Text fontWeight="700" fontSize="sm" color="white" mb={1}>Precisa de ajuda?</Text>
        <Text fontSize="xs" color="whiteAlpha.800" mb={3}>Acesse o Django Admin</Text>
        <Button size="sm" w="full" bg="white" color="navy.800" borderRadius="xl" fontWeight="600"
          fontSize="xs" as="a" href="/admin/" target="_blank" _hover={{ bg: 'gray.100' }}>
          Django Admin
        </Button>
      </Box>

      {/* User Info */}
      <HStack px={2} spacing={3}>
        <Flex
          w={9} h={9} borderRadius="full" flexShrink={0} align="center" justify="center"
          bg="linear-gradient(97.89deg,#4fd1c5 17.73%,#2b6cb0 100%)"
          boxShadow="0 4px 14px rgba(79,209,197,0.3)"
        >
          <Text fontWeight="700" fontSize="sm" color="white">{initial}</Text>
        </Flex>
        <Box overflow="hidden">
          <Text fontSize="sm" fontWeight="600" color="white" isTruncated>{user?.first_name || user?.username}</Text>
          <Text fontSize="xs" color="whiteAlpha.500">{user?.cargo_display}</Text>
        </Box>
      </HStack>
    </Flex>
  )
}
