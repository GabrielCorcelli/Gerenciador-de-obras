import { useState } from 'react'
import {
  Box, Flex, VStack, Text, Input, Button, FormControl, FormLabel,
  InputGroup, InputRightElement, IconButton, useToast, Heading,
} from '@chakra-ui/react'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate('/')
    } catch (err) {
      toast({ title: err.response?.data?.error || 'Erro ao fazer login', status: 'error', duration: 3000, isClosable: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Flex
      minH="100vh" align="center" justify="center"
      bgGradient="linear(to-br, navy.900, navy.700, navy.600)"
    >
      {/* Decorative circles */}
      <Box position="absolute" top="10%" right="15%" w="300px" h="300px" borderRadius="full"
        bg="brand.300" opacity={0.06} filter="blur(80px)" pointerEvents="none" />
      <Box position="absolute" bottom="15%" left="10%" w="250px" h="250px" borderRadius="full"
        bg="blue.400" opacity={0.08} filter="blur(60px)" pointerEvents="none" />

      <Box
        w="full" maxW="420px" mx={4} p={8} borderRadius="2xl"
        bg="navy.700" boxShadow="0 20px 60px rgba(0,0,0,0.5)"
        border="1px solid" borderColor="whiteAlpha.100"
      >
        <VStack spacing={6} as="form" onSubmit={handle}>
          <VStack spacing={2} w="full" textAlign="center">
            <Flex
              w={16} h={16} borderRadius="2xl" align="center" justify="center"
              bg="linear-gradient(97.89deg,#4fd1c5 17.73%,#2b6cb0 100%)"
              boxShadow="0 8px 26px rgba(79,209,197,0.4)" mb={2}
            >
              <Text fontSize="2xl" fontWeight="900" color="white">O</Text>
            </Flex>
            <Heading size="lg" color="white">ObraControl</Heading>
            <Text fontSize="sm" color="whiteAlpha.600">Sistema de Controle de Obras</Text>
          </VStack>

          <FormControl isRequired>
            <FormLabel fontSize="sm" color="whiteAlpha.700" fontWeight="600">Usuário</FormLabel>
            <Input
              placeholder="Digite seu usuário" value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontSize="sm" color="whiteAlpha.700" fontWeight="600">Senha</FormLabel>
            <InputGroup>
              <Input
                type={show ? 'text' : 'password'} placeholder="Digite sua senha"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              />
              <InputRightElement>
                <IconButton
                  variant="ghost" size="sm" aria-label="Mostrar senha"
                  icon={show ? <MdVisibilityOff /> : <MdVisibility />}
                  onClick={() => setShow(s => !s)} color="whiteAlpha.600"
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <Button type="submit" variant="brand" w="full" size="lg" isLoading={loading} loadingText="Entrando...">
            Entrar
          </Button>
        </VStack>
      </Box>
    </Flex>
  )
}
