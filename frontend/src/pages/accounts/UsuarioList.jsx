import { useEffect, useState } from 'react'
import {
  Box, Flex, Heading, Text, Button, Table, Thead, Tbody, Tr, Th, Td,
  Badge, HStack, Spinner, Center, useToast, Avatar,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  FormControl, FormLabel, Input, Select, VStack, Switch, useDisclosure,
} from '@chakra-ui/react'
import { MdAdd, MdEdit, MdPeople } from 'react-icons/md'
import { useAuth } from '../../contexts/AuthContext.jsx'
import api from '../../services/api.js'

const CARGO_COLOR = { admin: 'red', engenheiro: 'blue', financeiro: 'purple' }

function UsuarioModal({ isOpen, onClose, usuario, onSaved }) {
  const toast = useToast()
  const empty = { username: '', first_name: '', last_name: '', email: '', cargo: 'engenheiro', telefone: '', password: '', is_active: true }
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const isEdit = Boolean(usuario)

  useEffect(() => {
    setForm(usuario ? {
      username: usuario.username, first_name: usuario.first_name || '',
      last_name: usuario.last_name || '', email: usuario.email || '',
      cargo: usuario.cargo, telefone: usuario.telefone || '',
      password: '', is_active: usuario.is_active,
    } : empty)
  }, [usuario, isOpen])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const submit = async () => {
    setLoading(true)
    const payload = { ...form }
    if (!payload.password) delete payload.password
    try {
      if (isEdit) await api.patch(`usuarios/${usuario.id}/`, payload)
      else await api.post('usuarios/', payload)
      toast({ title: isEdit ? 'Usuário atualizado!' : 'Usuário criado!', status: 'success', duration: 2000 })
      onSaved(); onClose()
    } catch (e) {
      toast({ title: 'Erro ao salvar usuário', description: JSON.stringify(e.response?.data), status: 'error', duration: 5000 })
    } finally { setLoading(false) }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay bg="blackAlpha.700" />
      <ModalContent>
        <ModalHeader color="white">{isEdit ? 'Editar Usuário' : 'Novo Usuário'}</ModalHeader>
        <ModalBody>
          <VStack spacing={4}>
            <Flex gap={4} w="full">
              <FormControl isRequired flex={1}>
                <FormLabel fontSize="sm" color="whiteAlpha.700">Nome</FormLabel>
                <Input value={form.first_name} onChange={e => set('first_name', e.target.value)} />
              </FormControl>
              <FormControl flex={1}>
                <FormLabel fontSize="sm" color="whiteAlpha.700">Sobrenome</FormLabel>
                <Input value={form.last_name} onChange={e => set('last_name', e.target.value)} />
              </FormControl>
            </Flex>
            <FormControl isRequired>
              <FormLabel fontSize="sm" color="whiteAlpha.700">Usuário (login)</FormLabel>
              <Input value={form.username} onChange={e => set('username', e.target.value)} isReadOnly={isEdit} />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" color="whiteAlpha.700">E-mail</FormLabel>
              <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} />
            </FormControl>
            <Flex gap={4} w="full">
              <FormControl isRequired flex={1}>
                <FormLabel fontSize="sm" color="whiteAlpha.700">Cargo</FormLabel>
                <Select value={form.cargo} onChange={e => set('cargo', e.target.value)}>
                  <option value="admin">Administrador</option>
                  <option value="engenheiro">Engenheiro</option>
                  <option value="financeiro">Financeiro</option>
                </Select>
              </FormControl>
              <FormControl flex={1}>
                <FormLabel fontSize="sm" color="whiteAlpha.700">Telefone</FormLabel>
                <Input value={form.telefone} onChange={e => set('telefone', e.target.value)} />
              </FormControl>
            </Flex>
            <FormControl>
              <FormLabel fontSize="sm" color="whiteAlpha.700">{isEdit ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}</FormLabel>
              <Input type="password" value={form.password} onChange={e => set('password', e.target.value)} />
            </FormControl>
            {isEdit && (
              <FormControl>
                <Flex justify="space-between" align="center">
                  <FormLabel fontSize="sm" color="whiteAlpha.700" mb={0}>Ativo</FormLabel>
                  <Switch isChecked={form.is_active} onChange={e => set('is_active', e.target.checked)} colorScheme="teal" />
                </Flex>
              </FormControl>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter gap={3}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="brand" isLoading={loading} onClick={submit}>Salvar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default function UsuarioList() {
  const { user } = useAuth()
  const disc = useDisclosure()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [editUsuario, setEditUsuario] = useState(null)

  if (!user?.is_admin) return (
    <Center h="60vh" flexDirection="column" gap={4}>
      <Text fontSize="lg" color="whiteAlpha.500">Acesso restrito a administradores.</Text>
    </Center>
  )

  const load = () => {
    setLoading(true)
    api.get('usuarios/').then(r => setUsuarios(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Text fontSize="sm" color="whiteAlpha.500">Conta</Text>
          <Heading size="lg" color="white">Usuários do Sistema</Heading>
        </Box>
        <Button variant="brand" leftIcon={<MdAdd />} onClick={() => { setEditUsuario(null); disc.onOpen() }}>
          Novo Usuário
        </Button>
      </Flex>

      <Box bg="navy.700" borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.100" overflow="hidden">
        {loading ? (
          <Center py={16}><Spinner color="brand.300" /></Center>
        ) : (
          <Box overflowX="auto">
            <Table size="sm" variant="unstyled">
              <Thead>
                <Tr bg="navy.800">
                  {['Usuário','Login','E-mail','Cargo','Telefone','Status',''].map(h => (
                    <Th key={h} color="whiteAlpha.400" fontSize="10px" textTransform="uppercase" letterSpacing="wider" py={4} px={4}>{h}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {usuarios.map(u => (
                  <Tr key={u.id} _hover={{ bg: 'whiteAlpha.50' }}>
                    <Td py={3} px={4}>
                      <Flex align="center" gap={3}>
                        <Flex w={9} h={9} borderRadius="full"
                          bg="linear-gradient(97.89deg, #4fd1c5 17.73%, #2b6cb0 100%)"
                          align="center" justify="center" flexShrink={0}>
                          <Text fontSize="sm" fontWeight="700" color="white">
                            {(u.first_name || u.username)?.[0]?.toUpperCase()}
                          </Text>
                        </Flex>
                        <Box>
                          <Text fontSize="sm" color="white" fontWeight="600">{u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : u.username}</Text>
                          {u.first_name && <Text fontSize="xs" color="whiteAlpha.500">{u.username}</Text>}
                        </Box>
                      </Flex>
                    </Td>
                    <Td py={3} px={4} fontSize="xs" color="whiteAlpha.600">{u.username}</Td>
                    <Td py={3} px={4} fontSize="xs" color="whiteAlpha.600">{u.email || '—'}</Td>
                    <Td py={3} px={4}>
                      <Badge colorScheme={CARGO_COLOR[u.cargo] || 'gray'} borderRadius="full" px={3} py={1} fontSize="10px">
                        {u.cargo_display}
                      </Badge>
                    </Td>
                    <Td py={3} px={4} fontSize="xs" color="whiteAlpha.600">{u.telefone || '—'}</Td>
                    <Td py={3} px={4}>
                      <Badge colorScheme={u.is_active ? 'green' : 'red'} variant="subtle" borderRadius="full" px={2} fontSize="10px">
                        {u.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </Td>
                    <Td py={3} px={4}>
                      <Button size="xs" variant="ghost" color="brand.300" leftIcon={<MdEdit />}
                        onClick={() => { setEditUsuario(u); disc.onOpen() }}>Editar</Button>
                    </Td>
                  </Tr>
                ))}
                {usuarios.length === 0 && (
                  <Tr><Td colSpan={7} py={16} textAlign="center" color="whiteAlpha.400">Nenhum usuário encontrado.</Td></Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>

      <UsuarioModal isOpen={disc.isOpen} onClose={disc.onClose} usuario={editUsuario} onSaved={load} />
    </Box>
  )
}
