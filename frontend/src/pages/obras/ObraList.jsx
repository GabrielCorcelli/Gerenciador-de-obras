import { useEffect, useState } from 'react'
import {
  Box, Grid, Text, Heading, Flex, Button, Badge, Input, Select,
  HStack, Progress, Spinner, Center, InputGroup, InputLeftElement, Icon,
} from '@chakra-ui/react'
import { MdAdd, MdSearch, MdBusiness } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import api from '../../services/api.js'

const STATUS_COLOR = { em_andamento: 'green', planejada: 'cyan', pausada: 'yellow', concluida: 'gray', cancelada: 'red' }
const STATUS_LABEL = { em_andamento: 'Em Andamento', planejada: 'Planejada', pausada: 'Pausada', concluida: 'Concluída', cancelada: 'Cancelada' }

const toReal = v => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function ObraList() {
  const [obras, setObras] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [tipo, setTipo] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  const load = () => {
    setLoading(true)
    api.get('obras/', { params: { q, status, tipo } })
      .then(r => setObras(r.data.results || r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [q, status, tipo])

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={8} wrap="wrap" gap={3}>
        <Box>
          <Text fontSize="sm" color="whiteAlpha.500" mb={1}>Páginas / Obras</Text>
          <Heading size="lg" color="white">Obras</Heading>
        </Box>
        {user?.pode_editar && (
          <Button variant="brand" leftIcon={<MdAdd />} onClick={() => navigate('/obras/nova')}>
            Nova Obra
          </Button>
        )}
      </Flex>

      {/* Filters */}
      <Box bg="navy.700" borderRadius="2xl" p={5} mb={6} border="1px solid" borderColor="whiteAlpha.100">
        <HStack spacing={3} wrap="wrap">
          <InputGroup maxW="280px">
            <InputLeftElement pointerEvents="none">
              <Icon as={MdSearch} color="whiteAlpha.400" />
            </InputLeftElement>
            <Input placeholder="Nome ou cliente..." value={q} onChange={e => setQ(e.target.value)} pl={10} />
          </InputGroup>
          <Select maxW="180px" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">Todos status</option>
            <option value="planejada">Planejada</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluida">Concluída</option>
            <option value="pausada">Pausada</option>
            <option value="cancelada">Cancelada</option>
          </Select>
          <Select maxW="180px" value={tipo} onChange={e => setTipo(e.target.value)}>
            <option value="">Todos tipos</option>
            <option value="construcao">Construção</option>
            <option value="reforma">Reforma</option>
            <option value="ampliacao">Ampliação</option>
            <option value="manutencao">Manutenção</option>
          </Select>
        </HStack>
      </Box>

      {loading ? (
        <Center h="200px"><Spinner color="brand.300" size="xl" thickness="3px" /></Center>
      ) : obras.length === 0 ? (
        <Center flexDir="column" h="300px" bg="navy.700" borderRadius="2xl" border="1px solid" borderColor="whiteAlpha.100">
          <Icon as={MdBusiness} boxSize={16} color="whiteAlpha.200" mb={4} />
          <Text color="whiteAlpha.500" mb={4}>Nenhuma obra encontrada</Text>
          {user?.pode_editar && <Button variant="brand" leftIcon={<MdAdd />} onClick={() => navigate('/obras/nova')}>Cadastrar Obra</Button>}
        </Center>
      ) : (
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2,1fr)', xl: 'repeat(3,1fr)' }} gap={5}>
          {obras.map(obra => (
            <Box
              key={obra.id} bg="navy.700" borderRadius="2xl" p={6} cursor="pointer"
              border="1px solid" borderColor="whiteAlpha.100"
              transition="all 0.2s" _hover={{ transform: 'translateY(-4px)', borderColor: 'brand.300' }}
              onClick={() => navigate(`/obras/${obra.id}`)}
            >
              <HStack justify="space-between" mb={3}>
                <Badge colorScheme={STATUS_COLOR[obra.status] || 'gray'} borderRadius="full" px={3} py={1} fontSize="10px">
                  {STATUS_LABEL[obra.status] || obra.status}
                </Badge>
                <Badge variant="outline" borderColor="whiteAlpha.200" color="whiteAlpha.600" borderRadius="full" px={3} fontSize="10px">
                  {obra.tipo_obra_display}
                </Badge>
              </HStack>
              <Text fontWeight="700" fontSize="md" color="white" mb={1} noOfLines={1}>{obra.nome}</Text>
              <Text fontSize="xs" color="whiteAlpha.600" mb={1}>👤 {obra.cliente}</Text>
              <Text fontSize="xs" color="whiteAlpha.500" mb={4}>📍 {obra.cidade}/{obra.estado}</Text>
              <Box>
                <Flex justify="space-between" fontSize="xs" mb={1}>
                  <Text color="whiteAlpha.600">Orçamento: <Text as="span" color="white" fontWeight="600">{toReal(obra.orcamento_previsto)}</Text></Text>
                  <Text color={obra.gasto_total > obra.orcamento_previsto ? 'red.400' : 'brand.300'} fontWeight="600">
                    {toReal(obra.gasto_total)}
                  </Text>
                </Flex>
                <Progress
                  value={Math.min(obra.percentual_gasto, 100)}
                  size="xs" borderRadius="full"
                  colorScheme={obra.percentual_gasto > 100 ? 'red' : obra.percentual_gasto > 80 ? 'yellow' : 'teal'}
                />
                <Text fontSize="10px" color="whiteAlpha.400" mt={1}>{obra.percentual_gasto}% utilizado</Text>
              </Box>
              <Flex justify="space-between" mt={3} pt={3} borderTop="1px solid" borderColor="whiteAlpha.100">
                <Text fontSize="xs" color="whiteAlpha.500">📅 {new Date(obra.data_inicio).toLocaleDateString('pt-BR')}</Text>
                <Text fontSize="xs" color="whiteAlpha.500">→ {new Date(obra.data_previsao_fim).toLocaleDateString('pt-BR')}</Text>
              </Flex>
            </Box>
          ))}
        </Grid>
      )}
    </Box>
  )
}
