import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Paper, Typography, Box, 
  Card, CardContent, CardHeader, Divider 
} from '@mui/material';
import { 
  BarChart, Bar, PieChart, Pie, LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { getEstatisticas } from '../services/estatisticasService';

const Dashboard = () => {
  const [estatisticas, setEstatisticas] = useState({
    protocolosPorTipo: [],
    protocolosPorStatus: [],
    tempoMedioPorSetor: [],
    volumeDiario: []
  });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const buscarEstatisticas = async () => {
      try {
        setCarregando(true);
        const data = await getEstatisticas();
        setEstatisticas(data);
        setCarregando(false);
      } catch (error) {
        setErro('Erro ao carregar estatísticas');
        setCarregando(false);
      }
    };

    buscarEstatisticas();
  }, []);

  if (carregando) return <Typography>Carregando estatísticas...</Typography>;
  if (erro) return <Typography color="error">{erro}</Typography>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Analítico
      </Typography>
      
      <Grid container spacing={3}>
        {/* Resumo de Protocolos */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Total de Protocolos
            </Typography>
            <Typography component="p" variant="h4">
              {estatisticas.totalProtocolos}
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
              Ativos: {estatisticas.protocolosAtivos}
            </Typography>
          </Paper>
        </Grid>
        
        {/* Protocolos por Prioridade */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Por Prioridade
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" color="error">
                  Alta: {estatisticas.prioridadeAlta}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="warning.main">
                  Média: {estatisticas.prioridadeMedia}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="success.main">
                  Baixa: {estatisticas.prioridadeBaixa}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* Tempo Médio de Resolução */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Tempo Médio de Resolução
            </Typography>
            <Typography component="p" variant="h4">
              {estatisticas.tempoMedioResolucao} dias
            </Typography>
          </Paper>
        </Grid>
        
        {/* Gráfico de Protocolos por Tipo */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 300,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Protocolos por Tipo
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={estatisticas.protocolosPorTipo}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                  nameKey="nome"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Gráfico de Tempo Médio por Setor */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 300,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Tempo Médio por Setor (dias)
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={estatisticas.tempoMedioPorSetor}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="tempo" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        
        {/* Gráfico de Volume Diário */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 300,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Volume de Protocolos (Últimos 30 dias)
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={estatisticas.volumeDiario}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="novos" stroke="#8884d8" name="Novos" />
                <Line type="monotone" dataKey="concluidos" stroke="#82ca9d" name="Concluídos" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;