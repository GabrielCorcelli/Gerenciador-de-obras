import { useEffect, useState } from 'react'
import {
  Box, Grid, Text, Heading, Flex, Button, Badge, HStack, VStack,
  Progress, Spinner, Center, Table, Thead, Tbody, Tr, Th, Td,
  Tabs, TabList, TabPanels, Tab, TabPanel, Icon, useToast,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  FormControl, FormLabel, Input, Select, Textarea, useDisclosure,
} from '@chakra-ui/react'
import { MdAdd, MdEdit, MdDelete, MdArrowBack, MdPictureAsPdf } from 'react-icons/md'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import api from '../../services/api.js'

const STATUS_COLOR = { em_andamento: 'green', planejada: 'cyan', pausada: 'yellow', concluida: 'gray', cancelada: 'red' }
const toReal = v => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// ─── Compra Modal ───────────────────────────────────────────────
function CompraModal({ isOpen, onClose, obra, compra, categorias, onSaved }) {
  const toast = useToast()
  const today = new Date().toISOString().split('T')[0]
  const empty = { categoria: '', descricao: '', quantidade: '', unidade: 'un', preco_unitario: '', fornecedor: '', nota_fiscal: '', data_compra: today, observacoes: '' }
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setForm(compra ? {
      categoria: compra.categoria, descricao: compra.descricao, quantidade: compra.quantidade,
      unidade: compra.unidade, preco_unitario: compra.preco_unitario, fornecedor: compra.fornecedor || '',
      nota_fiscal: compra.nota_fiscal || '', data_compra: compra.data_compra, observacoes: compra.observacoes || '',
    } : empty)
  }, [compra, isOpen])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const submit = async () => {
    setLoading(true)
    try {
      if (compra) await api.patch(`compras/${compra.id}/`, { ...form, obra: obra.id })
      else await api.post(`obras/${obra.id}/compras/`, form)
      toast({ title: 'Compra salva!', status: 'success', duration: 2000 })
      onSaved(); onClose()
    } catch (e) {
      toast({ title: 'Erro ao salvar compra', description: JSON.stringify(e.response?.data), status: 'error', duration: 4000 })
    } finally { setLoading(false) }
  }

  const total = (Number(form.quantidade) || 0) * (Number(form.preco_unitario) || 0)

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay bg="blackAlpha.700" />
      <ModalContent>
        <ModalHeader color="white">{compra ? 'Editar Compra' : 'Nova Compra'}</ModalHeader>
        <ModalBody>
          <Grid templateColumns="1fr 1fr" gap={4}>
            <FormControl gridColumn="1/-1" isRequired>
              <FormLabel fontSize="sm" color="whiteAlpha.700">Descrição do Material</FormLabel>
              <Input value={form.descricao} onChange={e => set('descricao', e.target.value)} placeholder="Ex: Saco de cimento CP-II 50kg" />
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
                {[['un','Unidade'],['kg','Quilograma'],['m','Metro'],['m2','Metro²'],['m3','Metro³'],['l','Litro'],['saco','Saco'],['pc','Peça'],['cx','Caixa'],['rl','Rolo'],['vb','Verba']].map(([v,l]) =>
                  <option key={v} value={v}>{l}</option>)}
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm" color="whiteAlpha.700">Preço Unitário (R$)</FormLabel>
              <Input type="number" step="0.01" value={form.preco_unitario} onChange={e => set('preco_unitario', e.target.value)} />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="sm" color="whiteAlpha.700">Total Calculado</FormLabel>
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

// ─── Boleto Modal ────────────────────────────────────────────────
function BoletoModal({ isOpen, onClose, obra, boleto, onSaved }) {
  const toast = useToast()
  const today = new Date().toISOString().split('T')[0]
  const empty = { descricao: '', valor: '', data_vencimento: today, data_pagamento: '', observacoes: '' }
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setForm(boleto ? {
      descricao: boleto.descricao, valor: boleto.valor,
      data_vencimento: boleto.data_vencimento, data_pagamento: boleto.data_pagamento || '',
      observacoes: boleto.observacoes || '',
    } : empty)
  }, [boleto, isOpen])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const submit = async () => {
    setLoading(true)
    const payload = { ...form, data_pagamento: form.data_pagamento || null }
    try {
      if (boleto) await api.patch(`boletos/${boleto.id}/`, { ...payload, obra: obra.id })
      else await api.post(`obras/${obra.id}/boletos/`, payload)
      toast({ title: 'Boleto salvo!', status: 'success', duration: 2000 })
      onSaved(); onClose()
    } catch (e) {
      toast({ title: 'Erro ao salvar boleto', description: JSON.stringify(e.response?.data), status: 'error', duration: 4000 })
    } finally { setLoading(false) }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay bg="blackAlpha.700" />
      <ModalContent>
        <ModalHeader color="white">{boleto ? 'Editar Boleto' : 'Novo Boleto'}</ModalHeader>
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel fontSize="sm" color="whiteAlpha.700">Descrição</FormLabel>
              <Input value={form.descricao} onChange={e => set('descricao', e.target.value)} />
            </FormControl>
            <Grid templateColumns="1fr 1fr" gap={4} w="full">
              <FormControl isRequired>
                <FormLabel fontSize="sm" color="whiteAlpha.700">Valor (R$)</FormLabel>
                <Input type="number" step="0.01" value={form.valor} onChange={e => set('valor', e.target.value)} />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm" color="whiteAlpha.700">Vencimento</FormLabel>
                <Input type="date" value={form.data_vencimento} onChange={e => set('data_vencimento', e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel fontSize="sm" color="whiteAlpha.700">Data Pagamento</FormLabel>
                <Input type="date" value={form.data_pagamento} onChange={e => set('data_pagamento', e.target.value)} />
              </FormControl>
            </Grid>
            <FormControl>
              <FormLabel fontSize="sm" color="whiteAlpha.700">Observações</FormLabel>
              <Textarea value={form.observacoes} onChange={e => set('observacoes', e.target.value)} rows={2} />
            </FormControl>
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

// ─── ObraDetail ──────────────────────────────────────────────────
export default function ObraDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const [obra, setObra] = useState(null)
  const [compras, setCompras] = useState([])
  const [boletos, setBoletos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [editCompra, setEditCompra] = useState(null)
  const [editBoleto, setEditBoleto] = useState(null)
  const compraDisc = useDisclosure()
  const boletoDisc = useDisclosure()

  const loadAll = () => {
    api.get(`obras/${id}/`).then(r => setObra(r.data))
    api.get(`obras/${id}/compras/`).then(r => setCompras(r.data))
    api.get(`obras/${id}/boletos/`).then(r => setBoletos(r.data))
  }

  useEffect(() => {
    loadAll()
    api.get('categorias/').then(r => setCategorias(r.data))
  }, [id])

  const deleteCompra = async (cid) => {
    if (!confirm('Excluir compra?')) return
    await api.delete(`compras/${cid}/`)
    toast({ title: 'Compra excluída', status: 'info', duration: 2000 })
    loadAll()
  }

  const deleteBoleto = async (bid) => {
    if (!confirm('Excluir boleto?')) return
    await api.delete(`boletos/${bid}/`)
    toast({ title: 'Boleto excluído', status: 'info', duration: 2000 })
    loadAll()
  }

  const deleteObra = async () => {
    if (!confirm(`Excluir a obra "${obra.nome}"? Todas as compras e boletos serão excluídos.`)) return
    await api.delete(`obras/${id}/`)
    toast({ title: 'Obra excluída', status: 'info', duration: 2000 })
    navigate('/obras')
  }

  const downloadPdf = async () => {
    const r = await api.get(`obras/${id}/pdf/`, { responseType: 'blob' })
    const url = URL.createObjectURL(r.data)
    window.open(url)
  }

  if (!obra) return <Center h="60vh"><Spinner size="xl" color="brand.300" thickness="3px" /></Center>

  const totalBoletos = boletos.reduce((a, b) => a + Number(b.valor || 0), 0)

  return (
    <Box>
      <Flex justify="space-between" align="flex-start" mb={8} wrap="wrap" gap={3}>
        <Box>
          <Flex align="center" gap={2} mb={1}>
            <Button variant="ghost" size="sm" leftIcon={<MdArrowBack />} onClick={() => navigate('/obras')}>Obras</Button>
            <Text color="whiteAlpha.400">/</Text>
            <Text fontSize="sm" color="whiteAlpha.500">{obra.nome}</Text>
          </Flex>
          <Flex align="center" gap={3} wrap="wrap">
            <Heading size="lg" color="white">{obra.nome}</Heading>
            <Badge colorScheme={STATUS_COLOR[obra.status] || 'gray'} borderRadius="full" px={3} py={1}>{obra.status_display}</Badge>
            <Badge variant="outline" borderColor="whiteAlpha.300" color="whiteAlpha.600" borderRadius="full" px={3}>{obra.tipo_obra_display}</Badge>
          </Flex>
        </Box>
        {user?.pode_editar && (
          <HStack>
            <Button variant="outline" leftIcon={<MdPictureAsPdf />} size="sm" onClick={downloadPdf}>PDF</Button>
            <Button variant="outline" leftIcon={<MdEdit />} size="sm" onClick={() => navigate(`/obras/${id}/editar`)}>Editar</Button>
            <Button colorScheme="red" variant="outline" leftIcon={<MdDelete />} size="sm" onClick={deleteObra}>Excluir</Button>
          </HStack>
        )}
      </Flex>

      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={5} mb={6}>
        {/* Info */}
        <Box bg="navy.700" borderRadius="2xl" p={6} border="1px solid" borderColor="whiteAlpha.100">
          <Text fontWeight="700" color="white" mb={4}>Informações da Obra</Text>
          <Grid templateColumns="1fr 1fr" gap={4}>
            {[['Cliente', obra.cliente], ['Responsável', obra.responsavel_nome],
              ['Tipo', obra.tipo_obra_display], ['Status', obra.status_display]].map(([l, v]) => (
              <Box key={l}><Text fontSize="xs" color="whiteAlpha.500" mb={0.5}>{l}</Text><Text fontSize="sm" color="white" fontWeight="600">{v}</Text></Box>
            ))}
            <Box gridColumn="1/-1">
              <Text fontSize="xs" color="whiteAlpha.500" mb={0.5}>Endereço</Text>
              <Text fontSize="sm" color="white">{obra.endereco}, {obra.cidade}/{obra.estado} {obra.cep && `- CEP: ${obra.cep}`}</Text>
            </Box>
            {[['Início', obra.data_inicio && new Date(obra.data_inicio).toLocaleDateString('pt-BR')],
              ['Previsão Término', obra.data_previsao_fim && new Date(obra.data_previsao_fim).toLocaleDateString('pt-BR')],
              ['Conclusão Real', obra.data_fim_real ? new Date(obra.data_fim_real).toLocaleDateString('pt-BR') : '—']].map(([l, v]) => (
              <Box key={l}><Text fontSize="xs" color="whiteAlpha.500" mb={0.5}>{l}</Text><Text fontSize="sm" color="white">{v}</Text></Box>
            ))}
            {obra.observacoes && (
              <Box gridColumn="1/-1">
                <Text fontSize="xs" color="whiteAlpha.500" mb={0.5}>Observações</Text>
                <Text fontSize="sm" color="whiteAlpha.700">{obra.observacoes}</Text>
              </Box>
            )}
          </Grid>
        </Box>

        {/* Financial */}
        <VStack spacing={4} align="stretch">
          <Box bg="navy.700" borderRadius="2xl" p={6} border="1px solid" borderColor="whiteAlpha.100">
            <Text fontWeight="700" color="white" mb={4}>Resumo Financeiro</Text>
            {[['Orçamento', toReal(obra.orcamento_previsto), 'white'],
              ['Gasto Total', toReal(obra.gasto_total), obra.gasto_total > obra.orcamento_previsto ? 'red.400' : 'brand.300'],
              ['Saldo', toReal(obra.saldo), obra.saldo < 0 ? 'red.400' : 'green.300']].map(([l, v, c]) => (
              <Flex key={l} justify="space-between" mb={3}>
                <Text fontSize="sm" color="whiteAlpha.600">{l}</Text>
                <Text fontSize="sm" fontWeight="700" color={c}>{v}</Text>
              </Flex>
            ))}
            <Progress value={Math.min(obra.percentual_gasto, 100)} size="sm" borderRadius="full" mt={2}
              colorScheme={obra.percentual_gasto > 100 ? 'red' : obra.percentual_gasto > 80 ? 'yellow' : 'teal'} />
            <Text fontSize="xs" color="whiteAlpha.400" mt={1}>{obra.percentual_gasto}% do orçamento utilizado</Text>
          </Box>

          {/* Gastos por categoria */}
          {compras.length > 0 && (() => {
            const byCat = compras.reduce((acc, c) => {
              const k = c.categoria_nome; acc[k] = (acc[k] || 0) + Number(c.preco_total)
              return acc
            }, {})
            return (
              <Box bg="navy.700" borderRadius="2xl" p={6} border="1px solid" borderColor="whiteAlpha.100">
                <Text fontWeight="700" color="white" mb={4}>Por Categoria</Text>
                {Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([cat, val]) => (
                  <Flex key={cat} justify="space-between" mb={2}>
                    <Text fontSize="xs" color="whiteAlpha.600">{cat}</Text>
                    <Text fontSize="xs" fontWeight="700" color="brand.300">{toReal(val)}</Text>
                  </Flex>
                ))}
              </Box>
            )
          })()}
        </VStack>
      </Grid>

      {/* Tabs for Compras and Boletos */}
      <Box bg="navy.700" borderRadius="2xl" p={6} border="1px solid" borderColor="whiteAlpha.100">
        <Tabs colorScheme="teal" variant="soft-rounded">
          <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
            <TabList bg="navy.800" p={1} borderRadius="xl">
              <Tab fontSize="sm" fontWeight="600" color="whiteAlpha.600" _selected={{ bg: 'navy.600', color: 'white' }}>
                Compras de Material ({compras.length})
              </Tab>
              <Tab fontSize="sm" fontWeight="600" color="whiteAlpha.600" _selected={{ bg: 'navy.600', color: 'white' }}>
                Boletos ({boletos.length})
              </Tab>
            </TabList>
          </Flex>

          <TabPanels>
            {/* Compras */}
            <TabPanel p={0}>
              {user?.pode_editar && (
                <Button variant="brand" size="sm" leftIcon={<MdAdd />} mb={4}
                  onClick={() => { setEditCompra(null); compraDisc.onOpen() }}>
                  Nova Compra
                </Button>
              )}
              <Box overflowX="auto">
                <Table size="sm" variant="unstyled">
                  <Thead>
                    <Tr>
                      {['Data', 'Categoria', 'Descrição', 'Qtd', 'Un', 'Preço Un.', 'Total', 'Fornecedor', ...(user?.pode_editar ? [''] : [])].map(h => (
                        <Th key={h} color="whiteAlpha.400" fontSize="10px" textTransform="uppercase" letterSpacing="wider" pb={3} borderBottom="1px solid" borderColor="whiteAlpha.100">{h}</Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {compras.map(c => (
                      <Tr key={c.id} _hover={{ bg: 'whiteAlpha.50' }}>
                        <Td py={3} fontSize="xs" color="whiteAlpha.600">{new Date(c.data_compra).toLocaleDateString('pt-BR')}</Td>
                        <Td py={3}><Badge colorScheme="teal" variant="subtle" borderRadius="full" px={2} fontSize="10px">{c.categoria_nome}</Badge></Td>
                        <Td py={3} fontSize="sm" color="white" maxW="200px" isTruncated>{c.descricao}</Td>
                        <Td py={3} fontSize="xs" color="whiteAlpha.700" isNumeric>{Number(c.quantidade).toLocaleString('pt-BR')}</Td>
                        <Td py={3} fontSize="xs" color="whiteAlpha.500">{c.unidade_display}</Td>
                        <Td py={3} fontSize="xs" color="whiteAlpha.700" isNumeric>{toReal(c.preco_unitario)}</Td>
                        <Td py={3} fontSize="sm" fontWeight="700" color="brand.300" isNumeric>{toReal(c.preco_total)}</Td>
                        <Td py={3} fontSize="xs" color="whiteAlpha.500">{c.fornecedor || '—'}</Td>
                        {user?.pode_editar && (
                          <Td py={3}>
                            <HStack spacing={1}>
                              <Button size="xs" variant="ghost" color="brand.300" onClick={() => { setEditCompra(c); compraDisc.onOpen() }}><MdEdit /></Button>
                              <Button size="xs" variant="ghost" color="red.400" onClick={() => deleteCompra(c.id)}><MdDelete /></Button>
                            </HStack>
                          </Td>
                        )}
                      </Tr>
                    ))}
                    {compras.length > 0 && (
                      <Tr>
                        <Td colSpan={6} py={3} borderTop="1px solid" borderColor="whiteAlpha.200">
                          <Text fontSize="sm" fontWeight="700" color="white" textAlign="right">TOTAL</Text>
                        </Td>
                        <Td py={3} borderTop="1px solid" borderColor="whiteAlpha.200">
                          <Text fontSize="sm" fontWeight="700" color="brand.300" isNumeric>{toReal(obra.gasto_total)}</Text>
                        </Td>
                        <Td borderTop="1px solid" borderColor="whiteAlpha.200" />
                        {user?.pode_editar && <Td borderTop="1px solid" borderColor="whiteAlpha.200" />}
                      </Tr>
                    )}
                    {compras.length === 0 && (
                      <Tr><Td colSpan={9} py={8} textAlign="center" color="whiteAlpha.400">Nenhuma compra registrada.</Td></Tr>
                    )}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>

            {/* Boletos */}
            <TabPanel p={0}>
              {user?.pode_editar && (
                <Button variant="brand" size="sm" leftIcon={<MdAdd />} mb={4}
                  onClick={() => { setEditBoleto(null); boletoDisc.onOpen() }}>
                  Novo Boleto
                </Button>
              )}
              <Box overflowX="auto">
                <Table size="sm" variant="unstyled">
                  <Thead>
                    <Tr>
                      {['Descrição', 'Valor', 'Vencimento', 'Pagamento', 'Status', ...(user?.pode_editar ? [''] : [])].map(h => (
                        <Th key={h} color="whiteAlpha.400" fontSize="10px" textTransform="uppercase" letterSpacing="wider" pb={3} borderBottom="1px solid" borderColor="whiteAlpha.100">{h}</Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {boletos.map(b => (
                      <Tr key={b.id} _hover={{ bg: 'whiteAlpha.50' }}>
                        <Td py={3} fontSize="sm" color="white">{b.descricao}</Td>
                        <Td py={3} fontSize="sm" fontWeight="700" color="brand.300" isNumeric>{toReal(b.valor)}</Td>
                        <Td py={3} fontSize="xs" color="whiteAlpha.600">{new Date(b.data_vencimento).toLocaleDateString('pt-BR')}</Td>
                        <Td py={3} fontSize="xs" color="whiteAlpha.600">{b.data_pagamento ? new Date(b.data_pagamento).toLocaleDateString('pt-BR') : '—'}</Td>
                        <Td py={3}>
                          <Badge colorScheme={b.status_pagamento === 'pago' ? 'green' : 'yellow'} borderRadius="full" px={3} py={1} fontSize="10px">
                            {b.status_pagamento === 'pago' ? 'Pago' : 'Pendente'}
                          </Badge>
                        </Td>
                        {user?.pode_editar && (
                          <Td py={3}>
                            <HStack spacing={1}>
                              <Button size="xs" variant="ghost" color="brand.300" onClick={() => { setEditBoleto(b); boletoDisc.onOpen() }}><MdEdit /></Button>
                              <Button size="xs" variant="ghost" color="red.400" onClick={() => deleteBoleto(b.id)}><MdDelete /></Button>
                            </HStack>
                          </Td>
                        )}
                      </Tr>
                    ))}
                    {boletos.length > 0 && (
                      <Tr>
                        <Td py={3} borderTop="1px solid" borderColor="whiteAlpha.200">
                          <Text fontSize="sm" fontWeight="700" color="white">TOTAL</Text>
                        </Td>
                        <Td py={3} borderTop="1px solid" borderColor="whiteAlpha.200">
                          <Text fontSize="sm" fontWeight="700" color="brand.300" isNumeric>{toReal(totalBoletos)}</Text>
                        </Td>
                        <Td colSpan={user?.pode_editar ? 4 : 3} borderTop="1px solid" borderColor="whiteAlpha.200" />
                      </Tr>
                    )}
                    {boletos.length === 0 && (
                      <Tr><Td colSpan={6} py={8} textAlign="center" color="whiteAlpha.400">Nenhum boleto registrado.</Td></Tr>
                    )}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      <CompraModal isOpen={compraDisc.isOpen} onClose={compraDisc.onClose}
        obra={obra} compra={editCompra} categorias={categorias} onSaved={loadAll} />
      <BoletoModal isOpen={boletoDisc.isOpen} onClose={boletoDisc.onClose}
        obra={obra} boleto={editBoleto} onSaved={loadAll} />
    </Box>
  )
}
