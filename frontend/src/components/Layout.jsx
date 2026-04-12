import { Box, Flex } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'

const W = '260px'

export default function Layout() {
  return (
    <Flex minH="100vh">
      <Box w={W} minH="100vh" position="fixed" left={0} top={0} zIndex={100} display={{ base: 'none', lg: 'block' }}>
        <Sidebar />
      </Box>
      <Box ml={{ base: 0, lg: W }} flex={1} p={{ base: 4, lg: 6 }} minH="100vh">
        <Outlet />
      </Box>
    </Flex>
  )
}
