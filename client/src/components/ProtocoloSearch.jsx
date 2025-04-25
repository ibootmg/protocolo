import React, { useState } from 'react';
import { 
  Box, TextField, Button, Grid, FormControl, 
  InputLabel, Select, MenuItem, Paper, Typography 
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ptBR from 'date-fns/locale/pt-BR';

const ProtocoloSearch = ({ onSearch, setores }) => {
  const [filtros, setFiltros] = useState({
    numero: '',
    nomePaciente: '',
    tipoSolicitacao: '',
    status: '',
    setorAtual: '',
    prioridade: '',
    dataInicio: null,
    dataFim: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setFiltros(prev => ({ ...prev, [name]: date }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filtros);
  };

  const handleLimpar = () => {
    setFiltros({
      numero: '',
      nomePaciente: '',
      tipoSolicitacao: '',
      status: '',
      setorAtual: '',
      prioridade: '',
      dataInicio: null,
      dataFim: null
    });
    onSearch({});
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Busca Avançada
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Número do Protocolo"
              name="numero"
              value={filtros.numero}
              onChange={handleChange}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Nome do Paciente"
              name="nomePaciente"
              value={filtros.nomePaciente}
              onChange