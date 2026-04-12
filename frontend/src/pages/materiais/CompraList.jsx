import { useEffect, useState, useCallback } from 'react'
import {
  Box, Flex, Heading, Text, Input, Select, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Button, HStack, Spinner, Center, useToast, Link,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  FormControl, FormLabel, Textarea, Grid, useDisclosure,
} from '@chakra-ui/react'
import { MdSearch, MdEdit, MdDelete, MdAdd } from 'react-icons/md'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import api from '../../services/api.js'

const toReal = v => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const UNIDADES = [['un','Unidade'],['kg','Quilograma'],['m','Metro'],['m2','Metro²'],['m3','Metro³'],['l','Litro'],['saco','Saco'],['pc','Peça'],['cx','Caixa'],['rl','Rolo'],['vb','Verba']]

function CompraModal({ isOpen, onClose, compra, obras, categorias, onSaved }) {
  const toast = useToast()
  const today = new Date().toISOString().split('T')[0]
  const empty = { obra: '', categoria: '', descricao: '', quantidade: '', unidade: 'un', preco_unitario: '', fornecedor: '', nota_fiscal: '', data_compra: today, observacoes: '' }
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setForm(compra ? {
      obra: compra.obra, categoria: compra.categoria, descricao: compra.descricao,
      quantidade: compra.quantidade, unidade: compra.unidade, preco_unitario: compra.preco_unitario,
      fornecedor: compra.fornecedor || '', nota_fiscal: compra.nota_fiscal || '',
      data_compra: compra.data_compra, observacoes: compra.observacoes || '',
    } : empty)
  }, [compra, isOpen])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const total = (Number(form.quantidade) || 0) * (Number(form.preco_unitario) || 0)

  const submit = async () => {
    setLoading(true)
    try {
      if (compra) await api.patch(`compras/${compra.id}/`, form)
      else await api.post(`compras/`, form)
      toast({ title: 'Compra salva!', status: 'success', duration: 2000 })
      onSaved(); onClose()
    } catch (e) {
      toast({ title: 'Erro ao salvar', description: JSON.stringify(e.response?.data), status: 'error', duration: 4000 })
    } finally { setLoading(false) }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay bg="blackAlpha.700" />
      <ModalContent>
        <ModalHeader color="white">{compra ? 'Editar Compra' : 'Nova Compra'}</ModalHeader>
        <ModalBody>
          <Grid templateColumns="1fr 1fr" gap={4}>
            <FormControl gridColumn="1/-1" isRequired>
              <FormLabel fontSize="sm" color="whiteAlpha.700">Obra</FormLabel>
              <Select value={form.obra} onChange={e => set('obra', e.target.value)}>
                <option value="">Selecione a obra...</option>
                {obras.map(o => <option key={o.id} value={o.id}>{o.nome}</option>)}
              </Select>
            </FormControl>
            <FormControl gridColumn="1/-1" isRequired>
              <FormLabel fontSize="sm" color="whiteAlpha.700">Descrição do Material</FormLabel>
              <Input value={form.descricao} onChange={e => set('descricao', e.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm" color="whiteAlpha.700">Categoria</FormLabel>
              <Select value={form.categoria} onChange={e => set('categoria', e.target.value)}>
                <option value="">Selecione...</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm" color="whiteAlpha.700">Data da Compra</FormLabel>
              <Input type="date" value={form.data_compra} onChange={e => set('data_compra', e.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm" color="whiteAlpha.700">Quantidade</FormLabel>
              <Input type="number" step="0.01" value={form.quantidade} onChange={e => set('quantidade', e.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm" color="whiteAlpha.700">Unidade</FormLabel>
              <Select value={form.unidade} onChange={e => set('unidade', e.target.value)}>
                {UNIDADES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm" color="whiteAlpha.700">Preço Unitário (R$)</FormLabel>
              <Input type="number" step="0.01" value={form.preco_unitario} onChange={e => set('preco_unitario', e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" color="whiteAlpha.700">Total</FormLabel>
              <Box h="40px" display="flex" alignItems="center" px={4} bg="navy.600" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.200">
                <Text color="brand.300" fontWeight="700">{toReal(total)}</Text>
              </Box>
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" color="whiteAlpha.700">Fornecedor</FormLabel>
              <Input value={form.fornecedor} onChange={e => set('fornecedor', e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" color="whiteAlpha.700">Nota Fiscal</FormLabel>
              <Input value={form.nota_fiscal} onChange={e => set('nota_fiscal', e.target.value)} />
            </FormControl>
            <FormControl gridColumn="1/-1">
              <FormLabel fontSize="sm" color="whiteAlpha.700">Observações</FormLabel>
              <Textarea value={form.observacoes} onChange={e => set('observacoes', e.target.value)} rows={2} />
            </FormControl>
          </Grid>
        </ModalBody>
        <ModalFooter gap={3}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="brand" isLoading={loading} onClick={submit}>Salvar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default function CompraList() {
  const { user } = useAuth()
  const toast = useToast()
  const disc = useDisclosure()
  const [compras, setCompras] = useState([])
  const [obras, setObras] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [editCompra, setEditCompra] = useState(null)
  const [filter, setFilter] = useState({ q: '', obra: '', categoria: '' })

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter.q) params.set('q', filter.q)
    if (filter.obra) params.set('obra', filter.obra)
    if (filter.categoria) params.set('categoria', filter.categoria)
    api.get(`compras/?${params.toString()}`).then(r => setCompras(r.data)).finally(() => setLoading(false))
  }, [filter])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    api.get('obras/').then(r => setObras(r.data))
    api.get('categorias/').then(r => setCategorias(r.data))
  }, [])

  const deleteCompra = async (id) => {
    if (!confirm('Excluir esta compra?')) return
    await api.delete(`compras/${id}/`)
    toast({ title: 'Compra excluída', status: 'info', duration: 2000 })
    load()
  }

  const granTotal = compras.reduce((a, c) => a + Number(c.preco_total || 0), 0)

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Text fontSize="sm" color="whiteAlpha.500">Materiais</Text>
          <Heading size="lg" color="white">Compras de Material</Heading>
        </Box>
        {user?.pode_editar && (
          <Button variant="brand" leftIcon={<MdAdd />} onClick={() => { setEditCompra(null); disc.onOpen() }}>
            Nova Compra
          </Button>
        )}
      </Flex>

      {/* Filters */}
      <Grid templateColumns={{ base: '1fr', md: '2fr 1fr 1fr' }} gap={4} mb={6}>
        <Flex align="center" bg="navy.700" borderRadius="xl" px={4} border="1px solid" borderColor="whiteAlpha.100">
          <MdSearch size={18} color="rgba(255,255,255,0.4)" />
          <Input variant="unstyled" placeholder="Buscar por descrição..." value={filter.q}
            onChange={e => setFilter(p => ({ ...p, q: e.target.value }))} ml={2} fontSize="sm" />
        </Flex>
        <Select value={filter.obra} onChange={e => setFilter(p => ({ ...p, obra: e.target.value }))}
          variant="filled" bg="navy.700" borderColor="transparent" fontSize="sm" _hover={{ bg: 'navy.700' }} _focus={{ bg: 'navy.700' }}>
          <option value="">Todas as obras</option>
          {obras.map(o => <option key={o.id} value={o.id}>{o.nome}</option>)}
        </Select>
        <Select value={filter.categoria} onChange={e => setFilter(p => ({ ...p, categoria: e.target.value }))}
          variant="filled" bg="navy.700" borderColor="transparent" fontSize="sm" _hover={{ bg: 'navy.700' }} _focus={{ bg: 'navy.700' }}>
          <option value="">Todas as categorias</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </Select>
      </Grid>

      <Box bg="navy.700" borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.100" overflow="hidden">
        {loading ? (
          <Center py={16}><Spinner color="brand.300" /></Center>
        ) : (
          <Box overflowX="auto">
            <Table size="sm" variant="unstyled">
              <Thead>
                <Tr bg="navy.800">
                  {['Data','Obra','Categoria','Descrição','Qtd','Un','Preço Un.','Total','Fornecedor',...(user?.pode_editar ? [''] : [])].map(h => (
                    <Th key={h} color="whiteAlpha.400" fontSize="10px" textTransform="uppercase" letterSpacing="wider" py={4} px={4}>{h}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {compras.map(c => (
                  <Tr key={c.id} _hover={{ bg: 'whiteAlpha.50' }}>
                    <Td py={3} px={4} fontSize="xs" color="whiteAlpha.500" whiteSpace="nowrap">
                      {new Date(c.data_compra).toLocaleDateString('pt-BR')}
                    </Td>
                    <Td py={3} px={4}>
                      <Link as={RouterLink} to={`/obras/${c.obra}`} color="brand.300" fontSize="xs" fontWeight="600" noOfLines={1}>
                        {obras.find(o => o.id === c.obra)?.nome || `Obra #${c.obra}`}
                      </Link>
                    </Td>
                    <Td py={3} px={4}>
                      <Badge colorScheme="teal" variant="subtle" borderRadius="full" px={2} fontSize="10px">{c.categoria_nome}</Badge>
                    </Td>
                    <Td py={3} px={4} fontSize="sm" color="white" maxW="180px" isTruncated>{c.descricao}</Td>
                    <Td py={3} px={4} fontSize="xs" color="whiteAlpha.700" isNumeric>{Number(c.quantidade).toLocaleString('pt-BR')}</Td>
                    <Td py={3} px={4} fontSize="xs" color="whiteAlpha.500">{c.unidade_display}</Td>
                    <Td py={3} px={4} fontSize="xs" color="whiteAlpha.700" isNumeric>{toReal(c.preco_unitario)}</Td>
                    <Td py={3} px={4} fontSize="sm" fontWeight="700" color="brand.300" isNumeric>{toReal(c.preco_total)}</Td>
                    <Td py={3} px={4} fontSize="xs" color="whiteAlpha.500">{c.fornecedor || '—'}</Td>
                    {user?.pode_editar && (
                      <Td py={3} px={4}>
                        <HStack spacing={1}>
                          <Button size="xs" variant="ghost" color="brand.300" onClick={() => { setEditCompra(c); disc.onOpen() }}><MdEdit /></Button>
                          <Button size="xs" variant="ghost" color="red.400" onClick={() => deleteCompra(c.id)}><MdDelete /></Button>
                        </HStack>
                      </Td>
                    )}
                  </Tr>
                ))}
                {compras.length > 0 && (
                  <Tr bg="navy.800">
                    <Td colSpan={7} py={3} px={4}>
                      <Text fontSize="sm" fontWeight="700" color="white" textAlign="right">TOTAL GERAL</Text>
                    </Td>
                    <Td py={3} px={4} isNumeric>
                      <Text fontSize="sm" fontWeight="700" color="brand.300">{toReal(granTotal)}</Text>
                    </Td>
                    <Td colSpan={user?.pode_editar ? 2 : 1} />
                  </Tr>
                )}
                {compras.length === 0 && (
                  <Tr>
                    <Td colSpan={10} py={16} textAlign="center" color="whiteAlpha.400">
                      Nenhuma compra encontrada com os filtros aplicados.
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        )}
      </Box>

      <CompraModal isOpen={disc.isOpen} onClose={disc.onClose}
        compra={editCompra} obras={obras} categorias={categorias} onSaved={load} />
    </Box>
  )
}
