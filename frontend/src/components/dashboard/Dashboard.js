import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert, Form } from 'react-bootstrap';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    BarElement, 
    Title, 
    Tooltip, 
    Legend,
    ArcElement,
    PointElement,
    LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { obterEstatisticas } from '../../services/dashboard';

// Registrar componentes do Chart.js
ChartJS.register(
    CategoryScale, 
    LinearScale, 
    BarElement, 
    Title, 
    Tooltip, 
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

const Dashboard = () => {
    const [estatisticas, setEstatisticas] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [periodo, setPeriodo] = useState('mes'); // 'semana', 'mes', 'ano'

    useEffect(() => {
        const fetchEstatisticas = async () => {
            try {
                setLoading(true);
                const data = await obterEstatisticas(periodo);
                setEstatisticas(data);
            } catch (err) {
                setError('Erro ao carregar estatísticas. Tente novamente.');
                console.error('Erro ao obter estatísticas:', err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchEstatisticas();
    }, [periodo]);

    if (loading) {
        return (
            <div className="d-flex justify-content-center my-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </Spinner>
            </div>
        );
    }

    if (error && !estatisticas) {
        return <Alert variant="danger">{error}</Alert>;
    }

    // Configuração para o gráfico de volume por tipo
    const volumePorTipoConfig = {
        labels: estatisticas.volumePorTipo.map(item => item.tipo),
        datasets: [
            {
                label: 'Quantidade',
                data: estatisticas.volumePorTipo.map(item => item.quantidade),
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }
        ]
    };

    // Configuração para o gráfico de tempo médio por setor
    const tempoMedioPorSetorConfig = {
        labels: estatisticas.tempoMedioPorSetor.map(item => item.setor),
        datasets: [
            {
                label: 'Tempo Médio (horas)',
                data: estatisticas.tempoMedioPorSetor.map(item => item.tempo_medio),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }
        ]
    };

    // Configuração para o gráfico de taxa de resolução
    const taxaResolucaoConfig = {
        labels: estatisticas.taxaResolucao.map(item => item.setor),
        datasets: [
            {
                label: 'Taxa de Resolução (%)',
                data: estatisticas.taxaResolucao.map(item => item.taxa),
                backgroundColor: 'rgba(255, 159, 64, 0.6)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1
            }
        ]
    };

    // Configuração para o gráfico de tendência de protocolos
    const tendenciaProtocolosConfig = {
        labels: estatisticas.tendenciaProtocolos.map(item => item.data),
        datasets: [
            {
                label: 'Novos Protocolos',
                data: estatisticas.tendenciaProtocolos.map(item => item.quantidade),
                fill: false,
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                tension: 0.1
            }
        ]
    };

    return (
        <div className="dashboard">
            <h2>Dashboard Analítico</h2>
            
            <Form.Group className="mb-4">
                <Form.Label>Período de Análise</Form.Label>
                <Form.Control 
                    as="select" 
                    value={periodo} 
                    onChange={(e) => setPeriodo(e.target.value)}
                >
                    <option value="semana">Última Semana</option>
                    <option value="mes">Último Mês</option>
                    <option value="ano">Último Ano</option>
                </Form.Control>
            </Form.Group>
            
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <Card.Title>Total de Protocolos</Card.Title>
                            <h2>{estatisticas.totalProtocolos}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <Card.Title>Em Análise</Card.Title>
                            <h2>{estatisticas.protocolosEmAnalise}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <Card.Title>Concluídos</Card.Title>
                            <h2>{estatisticas.protocolosConcluidos}</h2>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center h-100">
                        <Card.Body>
                            <Card.Title>Tempo Médio (dias)</Card.Title>
                            <h2>{estatisticas.tempoMedioTotal}</h2>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            <Row className="mb-4">
                <Col md={6}>
                    <Card>
                        <Card.Header>Volume de Protocolos por Tipo</Card.Header>
                        <Card.Body>
                            <Pie data={volumePorTipoConfig} />
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card>
                        <Card.Header>Tempo Médio por Setor (horas)</Card.Header>
                        <Card.Body>
                            <Bar data={tempoMedioPorSetorConfig} />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            <Row className="mb-4">
                <Col md={6}>
                    <Card>
                        <Card.Header>Taxa de Resolução por Setor</Card.Header>
                        <Card.Body>
                            <Bar data={taxaResolucaoConfig} />
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card>
                        <Card.Header>Tendência de Novos Protocolos</Card.Header>
                        <Card.Body>
                            <Line data={tendenciaProtocolosConfig} />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            <Row>
                <Col md={12}>
                    <Card>
                        <Card.Header>Protocolos com Prazo Crítico</Card.Header>
                        <Card.Body>
                            {estatisticas.protocolosCriticos && estatisticas.protocolosCriticos.length > 0 ? (
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Número</th>
                                            <th>Paciente</th>
                                            <th>Tipo</th>
                                            <th>Setor Atual</th>
                                            <th>Dias em Espera</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {estatisticas.protocolosCriticos.map((protocolo, index) => (
                                            <tr key={index}>
                                                <td>{protocolo.numero}</td>
                                                <td>{protocolo.paciente}</td>
                                                <td>{protocolo.tipo}</td>
                                                <td>{protocolo.setor_atual}</td>
                                                <td>{protocolo.dias_espera}</td>
                                                <td>
                                                    <a href={`/protocolos/${protocolo.id}`} className="btn btn-sm btn-info me-1">
                                                        Ver
                                                    </a>
                                                    <a href={`/protocolos/${protocolo.id}/movimentar`} className="btn btn-sm btn-warning">
                                                        Movimentar
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-center">Não há protocolos com prazo crítico no momento.</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;