import { useEffect, useState } from 'react'
import {
  Box, Grid, Heading, Button, FormControl, FormLabel, Input, Select,
  Textarea, VStack, HStack, Text, Spinner, Center, useToast, Flex,
} from '@chakra-ui/react'
import { MdArrowBack, MdSave } from 'react-icons/md'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api.js'

const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const empty = {
  nome: '', tipo_obra: 'construcao', status: 'planejada', descricao: '',
  cliente: '', responsavel: '', endereco: '', cidade: '', estado: '', cep: '',
  orcamento_previsto: '', data_inicio: '', data_previsao_fim: '', data_fim_real: '',
  observacoes: '',
}

export default function ObraForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const isEdit = Boolean(id)
  const [form, setForm] = useState(empty)
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)

  useEffect(() => {
    api.get('usuarios/').then(r => setUsuarios(r.data)).catch(() => {})
    if (isEdit) {
      api.get(`obras/${id}/`).then(r => {
        const d = r.data
        setForm({
          nome: d.nome || '', tipo_obra: d.tipo_obra || 'construcao',
          status: d.status || 'planejada', descricao: d.descricao || '',
          cliente: d.cliente || '', responsavel: d.responsavel || '',
          endereco: d.endereco || '', cidade: d.cidade || '',
          estado: d.estado || '', cep: d.cep || '',
          orcamento_previsto: d.orcamento_previsto || '',
          data_inicio: d.data_inicio || '',
          data_previsao_fim: d.data_previsao_fim || '',
          data_fim_real: d.data_fim_real || '',
          observacoes: d.observacoes || '',
        })
      }).finally(() => setFetching(false))
    }
  }, [id])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const submit = async () => {
    if (!form.nome || !form.orcamento_previsto) {
      toast({ title: 'Nome e orçamento são obrigatórios.', status: 'warning', duration: 3000 })
      return
    }
    setLoading(true)
    const payload = {
      ...form,
      responsavel: form.responsavel || null,
      data_inicio: form.data_inicio || null,
      data_previsao_fim: form.data_previsao_fim || null,
      data_fim_real: form.data_fim_real || null,
    }
    try {
      let obra
      if (isEdit) {
        obra = (await api.patch(`obras/${id}/`, payload)).data
      } else {
        obra = (await api.post('obras/', payload)).data
      }
      toast({ title: isEdit ? 'Obra atualizada!' : 'Obra criada!', status: 'success', duration: 2000 })
      navigate(`/obras/${obra.id}`)
    } catch (e) {
      toast({ title: 'Erro ao salvar obra', description: JSON.stringify(e.response?.data), status: 'error', duration: 5000 })
    } finally { setLoading(false) }
  }

  if (fetching) return <Center h="60vh"><Spinner size="xl" color="brand.300" thickness="3px" /></Center>

  const field = (label, key, type = 'text', required = false) => (
    <FormControl isRequired={required}>
      <FormLabel fontSize="sm" color="whiteAlpha.700">{label}</FormLabel>
      <Input type={type} value={form[key]} onChange={e => set(key, e.target.value)} />
    </FormControl>
  )

  return (
    <Box maxW="900px">
      <Flex align="center" gap={3} mb={8}>
        <Button variant="ghost" size="sm" leftIcon={<MdArrowBack />} onClick={() => navigate(isEdit ? `/obras/${id}` : '/obras')}>
          Voltar
        </Button>
        <Box>
          <Text fontSize="sm" color="whiteAlpha.500">{isEdit ? 'Editar Obra' : 'Nova Obra'}</Text>
          <Heading size="lg" color="white">{isEdit ? form.nome || '...' : 'Nova Obra'}</Heading>
        </Box>
      </Flex>

      <VStack spacing={6} align="stretch">
        {/* Basic info */}
        <Box bg="navy.700" borderRadius="2xl" p={6} border="1px solid" borderColor="whiteAlpha.100">
          <Text fontWeight="700" color="white" mb={4}>Informações Básicas</Text>
          <Grid templateColumns={{ base: '1fr', md: '2fr 1fr 1fr' }} gap={4}>
            {field('Nome da Obra', 'nome', 'text', true)}
            <FormControl isRequired>
              <FormLabel fontSize="sm" color="whiteAlpha.700">Tipo</FormLabel>
              <Select value={form.tipo_obra} onChange={e => set('tipo_obra', e.target.value)}>
                <option value="construcao">Construção</option>
                <option value="reforma">Reforma</option>
                <option value="ampliacao">Ampliação</option>
                <option value="manutencao">Manutenção</option>
                <option value="demolicao">Demolição</option>
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel fontSize="sm" color="whiteAlpha.700">Status</FormLabel>
              <Select value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="planejada">Planejada</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="pausada">Pausada</option>
                <option value="concluida">Concluída</option>
                <option value="cancelada">Cancelada</option>
              </Select>
            </FormControl>
          </Grid>
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4} mt={4}>
            {field('Cliente', 'cliente')}
            <FormControl>
              <FormLabel fontSize="sm" color="whiteAlpha.700">Responsável</FormLabel>
              <Select value={form.responsavel} onChange={e => set('responsavel', e.target.value)}>
                <option value="">Selecione...</option>
                {usuarios.map(u => <option key={u.id} value={u.id}>{u.first_name || u.username} ({u.cargo_display})</option>)}
              </Select>
            </FormControl>
          </Grid>
          <FormControl mt={4}>
            <FormLabel fontSize="sm" color="whiteAlpha.700">Descrição</FormLabel>
            <Textarea value={form.descricao} onChange={e => set('descricao', e.target.value)} rows={3} />
          </FormControl>
        </Box>

        {/* Endereço */}
        <Box bg="navy.700" borderRadius="2xl" p={6} border="1px solid" borderColor="whiteAlpha.100">
          <Text fontWeight="700" color="white" mb={4}>Endereço</Text>
          <Grid templateColumns={{ base: '1fr', md: '3fr 2fr 1fr 1fr' }} gap={4}>
            {field('Endereço', 'endereco')}
            {field('Cidade', 'cidade')}
            <FormControl>
              <FormLabel fontSize="sm" color="whiteAlpha.700">Estado</FormLabel>
              <Select value={form.estado} onChange={e => set('estado', e.target.value)}>
                <option value="">UF</option>
                {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </Select>
            </FormControl>
            {field('CEP', 'cep')}
          </Grid>
        </Box>

        {/* Datas & Orçamento */}
        <Box bg="navy.700" borderRadius="2xl" p={6} border="1px solid" borderColor="whiteAlpha.100">
          <Text fontWeight="700" color="white" mb={4}>Datas e Orçamento</Text>
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr 1fr 1fr' }} gap={4}>
            {field('Data de Início', 'data_inicio', 'date')}
            {field('Previsão de Término', 'data_previsao_fim', 'date')}
            {field('Data de Conclusão Real', 'data_fim_real', 'date')}
            <FormControl isRequired>
              <FormLabel fontSize="sm" color="whiteAlpha.700">Orçamento Previsto (R$)</FormLabel>
              <Input type="number" step="0.01" value={form.orcamento_previsto} onChange={e => set('orcamento_previsto', e.target.value)} />
            </FormControl>
          </Grid>
        </Box>

        {/* Observações */}
        <Box bg="navy.700" borderRadius="2xl" p={6} border="1px solid" borderColor="whiteAlpha.100">
          <FormControl>
            <FormLabel fontSize="sm" color="whiteAlpha.700">Observações</FormLabel>
            <Textarea value={form.observacoes} onChange={e => set('observacoes', e.target.value)} rows={4} />
          </FormControl>
        </Box>

        <HStack justify="flex-end">
          <Button variant="ghost" onClick={() => navigate(isEdit ? `/obras/${id}` : '/obras')}>Cancelar</Button>
          <Button variant="brand" leftIcon={<MdSave />} isLoading={loading} loadingText="Salvando..." onClick={submit}>
            {isEdit ? 'Salvar Alterações' : 'Criar Obra'}
          </Button>
        </HStack>
      </VStack>
    </Box>
  )
}
