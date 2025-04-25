import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Badge, Pagination, Form, Row, Col } from 'react-bootstrap';
import { FaEye, FaEdit, FaExchangeAlt } from 'react-icons/fa';
import { listarProtocolos } from '../../services/protocolos';
import { formatarData } from '../../utils/formatters';

const ProtocoloList = () => {
    const [protocolos, setProtocolos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paginacao, setPaginacao] = useState({
        paginaAtual: 1,
        totalPaginas: 1
    });
    const [filtros, setFiltros] = useState({
        status: '',
        prioridade: '',
        setor: ''
    });

    useEffect(() => {
        carregarProtocolos();
    }, [paginacao.paginaAtual, filtros]);

    const carregarProtocolos = async () => {
        try {
            setLoading(true);
            const response = await listarProtocolos(paginacao.paginaAtual, filtros);
            setProtocolos(response.protocolos);
            setPaginacao({
                paginaAtual: response.paginacao.pagina_atual,
                totalPaginas: response.paginacao.total_paginas
            });
        } catch (error) {
            console.error('Erro ao carregar protocolos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({
            ...prev,
            [name]: value
        }));
        setPaginacao(prev => ({
            ...prev,
            paginaAtual: 1
        }));
    };

    const handlePageChange = (page) => {
        setPaginacao(prev => ({
            ...prev,
            paginaAtual: page
        }));
    };

    const getBadgeVariant = (status) => {
        switch (status) {
            case 'em_analise': return 'warning';
            case 'aprovado': return 'success';
            case 'pendente': return 'info';
            case 'concluido': return 'secondary';
            default: return 'light';
        }
    };

    const getPrioridadeBadge = (prioridade) => {
        switch (prioridade) {
            case 'alta': return 'danger';
            case 'media': return 'warning';
            case 'baixa': return 'info';
            default: return 'light';
        }
    };

    return (
        <div className="protocolo-list">
            <h2>Protocolos</h2>
            
            <Row className="mb-3">
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Status</Form.Label>
                        <Form.Control 
                            as="select" 
                            name="status" 
                            value={filtros.status}
                            onChange={handleFiltroChange}
                        >
                            <option value="">Todos</option>
                            <option value="em_analise">Em Análise</option>
                            <option value="aprovado">Aprovado</option>
                            <option value="pendente">Pendente</option>
                            <option value="concluido">Concluído</option>
                        </Form.Control>
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Prioridade</Form.Label>
                        <Form.Control 
                            as="select" 
                            name="prioridade" 
                            value={filtros.prioridade}
                            onChange={handleFiltroChange}
                        >
                            <option value="">Todas</option>
                            <option value="alta">Alta</option>
                            <option value="media">Média</option>
                            <option value="baixa">Baixa</option>
                        </Form.Control>
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Setor Atual</Form.Label>
                        <Form.Control 
                            as="select" 
                            name="setor" 
                            value={filtros.setor}
                            onChange={handleFiltroChange}
                        >
                            <option value="">Todos</option>
                            <option value="Sala 04">Sala 04</option>