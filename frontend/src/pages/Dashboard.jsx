import { useEffect, useState } from 'react'
import {
  Box, Grid, Text, Heading, Flex, Spinner, Center,
  Table, Thead, Tbody, Tr, Th, Td, Badge, HStack,
} from '@chakra-ui/react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts'
import { MdBusiness, MdBuild, MdAttachMoney, MdWarning } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import StatCard from '../components/StatCard.jsx'
import api from '../services/api.js'

const STATUS_COLOR = { em_andamento: 'green', planejada: 'cyan', pausada: 'yellow', concluida: 'gray', cancelada: 'red' }
const STATUS_LABEL = { em_andamento: 'Em Andamento', planejada: 'Planejada', pausada: 'Pausada', concluida: 'Concluída', cancelada: 'Cancelada' }

const toReal = v => `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <Box bg="navy.600" p={3} borderRadius="xl" border="1px solid" borderColor="whiteAlpha.200">
      <Text fontSize="xs" color="whiteAlpha.600" mb={1}>{label}</Text>
      <Text fontSize="sm" fontWeight="700" color="brand.300">{toReal(payload[0].value)}</Text>
    </Box>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const navigate = useNavigate()

  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('dashboard/')
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.detail || 'Erro ao carregar dashboard.'))
  }, [])

  if (error) return <Center h="60vh"><Text color="red.400">{error}</Text></Center>
  if (!data) return <Center h="60vh"><Spinner size="xl" color="brand.300" thickness="3px" /></Center>

  return (
    <Box>
      <Text fontSize="sm" color="whiteAlpha.500" mb={1}>Páginas / Dashboard</Text>
      <Heading size="lg" color="white" mb={8}>Dashboard</Heading>

      {/* Stat Cards */}
      <Grid templateColumns={{ base: '1fr', sm: 'repeat(2,1fr)', xl: 'repeat(4,1fr)' }} gap={5} mb={8}>
        <StatCard title="Total de Obras" value={data.total_obras} icon={MdBusiness}
          gradient="linear-gradient(97.89deg,#868CFF 17.73%,#4318FF 100%)" />
        <StatCard title="Obras Ativas" value={data.obras_ativas} icon={MdBuild}
          gradient="linear-gradient(97.89deg,#4fd1c5 17.73%,#2b6cb0 100%)" />
        <StatCard title="Gasto Total" value={toReal(data.gasto_total)} icon={MdAttachMoney}
          gradient="linear-gradient(97.89deg,#FF9966 17.73%,#FF5E62 100%)" />
        <StatCard title="Obras Atrasadas" value={data.obras_atrasadas} icon={MdWarning}
          gradient="linear-gradient(97.89deg,#FF6B6B 17.73%,#C0392B 100%)" />
      </Grid>

      {/* Charts */}
      <Grid templateColumns={{ base: '1fr', lg: '3fr 2fr' }} gap={5} mb={8}>
        <Box bg="navy.700" borderRadius="2xl" p={6} border="1px solid" borderColor="whiteAlpha.100">
          <Text fontWeight="700" fontSize="sm" color="white" mb={0}>Gastos por Obra</Text>
          <Text fontSize="xs" color="whiteAlpha.500" mb={4}>Top 10 por valor gasto</Text>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.gastos_por_obra} margin={{ bottom: 40, left: 0, right: 0 }}>
              <defs>
                <linearGradient id="bG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4fd1c5" />
                  <stop offset="100%" stopColor="#2b6cb0" />
                </linearGradient>
              </defs>
              <XAxis dataKey="nome" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="gasto" fill="url(#bG)" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Box bg="navy.700" borderRadius="2xl" p={6} border="1px solid" borderColor="whiteAlpha.100">
          <Text fontWeight="700" fontSize="sm" color="white" mb={0}>Gastos por Categoria</Text>
          <Text fontSize="xs" color="brand.300" mb={4}>{data.gastos_por_categoria.length} categorias com lançamentos</Text>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.gastos_por_categoria} margin={{ bottom: 40, left: 0, right: 0 }}>
              <defs>
                <linearGradient id="aG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4fd1c5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4fd1c5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="categoria__nome" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" stroke="#4fd1c5" fill="url(#aG)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Grid>

      {/* Recent Obras */}
      <Box bg="navy.700" borderRadius="2xl" p={6} border="1px solid" borderColor="whiteAlpha.100">
        <Text fontWeight="700" color="white" mb={4}>Obras Recentes</Text>
        <Box overflowX="auto">
          <Table size="sm" variant="unstyled">
            <Thead>
              <Tr>
                {['Nome', 'Cliente', 'Gasto', 'Orçamento', 'Status'].map(h => (
                  <Th key={h} color="whiteAlpha.400" fontSize="10px" textTransform="uppercase" letterSpacing="wider" pb={3}>{h}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {data.obras_recentes.map(o => (
                <Tr key={o.id} cursor="pointer" _hover={{ bg: 'whiteAlpha.50' }} onClick={() => navigate(`/obras/${o.id}`)}>
                  <Td py={3} color="white" fontWeight="600">{o.nome}</Td>
                  <Td py={3} color="whiteAlpha.600">{o.cliente}</Td>
                  <Td py={3} color="brand.300" fontWeight="600">{toReal(o.gasto_total)}</Td>
                  <Td py={3} color="whiteAlpha.600">{toReal(o.orcamento_previsto)}</Td>
                  <Td py={3}>
                    <Badge colorScheme={STATUS_COLOR[o.status] || 'gray'} borderRadius="full" px={3} py={1} fontSize="10px">
                      {STATUS_LABEL[o.status] || o.status}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Box>
  )
}
