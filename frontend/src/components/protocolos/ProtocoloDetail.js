import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button, Badge, Alert, Spinner, Table, Row, Col } from 'react-bootstrap';
import { FaEdit, FaExchangeAlt, FaDownload, FaHistory } from 'react-icons/fa';
import { obterProtocolo, baixarDocumento } from '../../services/protocolos';
import { formatarData } from '../../utils/formatters';

const ProtocoloDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [protocolo, setProtocolo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProtocolo = async () => {
            try {
                setLoading(true);
                const data = await obterProtocolo(id);
                setProtocolo(data);
            } catch (err) {
                setError('Erro ao carregar dados do protocolo. Tente novamente.');
                console.error('Erro ao obter protocolo:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProtocolo();
    }, [id]);

    const handleDownload = async (documentoId) => {
        try {
            await baixarDocumento(documentoId);
        } catch (err) {
            console.error('Erro ao baixar documento:', err);
        }
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

    if (loading) {
        return (
            <div className="d-flex justify-content-center my-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </Spinner>
            </div>
        );
    }

    if (error && !protocolo) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <div className="protocolo-detail">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Protocolo #{protocolo.numero}</h2>
                <div>
                    <Button 
                        variant="outline-primary" 
                        className="me-2"
                        as={Link}
                        to={`/protocolos/editar/${id}`}
                    >
                        <FaEdit /> Editar
                    </Button>
                    <Button 
                        variant="outline-success"
                        as={Link}
                        to={`/protocolos/movimentar/${id}`}
                    >
                        <FaExchangeAlt /> Movimentar
                    </Button>
                </div>
            </div>

            <Row>
                <Col md={8}>
                    <Card className="mb-4">
                        <Card.Header>Informações do Protocolo</Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <p><strong>Data de Entrada:</strong> {formatarData(protocolo.data_entrada)}</p>
                                    <p>
                                        <strong>Status:</strong>{' '}
                                        <Badge bg={getBadgeVariant(protocolo.status)}>
                                            {protocolo.status === 'em_analise' ? 'Em Análise' : 
                                             protocolo.status === 'aprovado' ? 'Aprovado' : 
                                             protocolo.status === 'pendente' ? 'Pendente' : 'Concluído'}
                                        </Badge>
                                    </p>
                                    <p>
                                        <strong>Prioridade:</strong>{' '}
                                        <Badge bg={getPrioridadeBadge(protocolo.prioridade)}>
                                            {protocolo.prioridade === 'alta' ? 'Alta' : 
                                             protocolo.prioridade === 'media' ? 'Média' : 'Baixa'}
                                        </Badge>
                                    </p>
                                </Col>
                                <Col md={6}>
                                    <p><strong>Tipo de Solicitação:</strong> {protocolo.tipo_solicitacao}</p>
                                    <p><strong>Setor Atual:</strong> {protocolo.setor_atual}</p>
                                    <p><strong>Última Atualização:</strong> {formatarData(protocolo.ultima_atualizacao)}</p>
                                </Col>
                            </Row>
                            <hr />
                            <h6>Descrição:</h6>
                            <p>{protocolo.descricao}</p>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <span>Histórico de Movimentações</span>
                            <Button variant="link" size="sm" as={Link} to={`/protocolos/${id}/historico`}>
                                <FaHistory /> Ver Completo
                            </Button>
                        </Card.Header>
                        <Card.Body>
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>Data</th>
                                        <th>De</th>
                                        <th>Para</th>
                                        <th>Responsável</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {protocolo.movimentacoes && protocolo.movimentacoes.slice(0, 5).map((mov, index) => (
                                        <tr key={index}>
                                            <td>{formatarData(mov.data)}</td>
                                            <td>{mov.setor_origem || 'Entrada'}</td>
                                            <td>{mov.setor_destino}</td>
                                            <td>{mov.responsavel}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="mb-4">
                        <Card.Header>Dados do Paciente</Card.Header>
                        <Card.Body>
                            <p><strong>Nome:</strong> {protocolo.paciente.nome}</p>
                            <p><strong>CPF:</strong> {protocolo.paciente.cpf}</p>
                            <p><strong>Data de Nascimento:</strong> {formatarData(protocolo.paciente.data_nascimento)}</p>
                            <p><strong>Telefone:</strong> {protocolo.paciente.telefone}</p>
                        </Card.Body>
                    </Card>

                    <Card>
                        <Card.Header>Documentos Anexados</Card.Header>
                        <Card.Body>
                            {protocolo.documentos && protocolo.documentos.length > 0 ? (
                                <ul className="list-group">
                                    {protocolo.documentos.map((doc, index) => (
                                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                            <span>{doc.nome}</span>
                                            <Button 
                                                variant="outline-primary" 
                                                size="sm"
                                                onClick={() => handleDownload(doc.id)}
                                            >
                                                <FaDownload />
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted">Nenhum documento anexado.</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ProtocoloDetail;