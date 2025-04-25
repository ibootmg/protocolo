import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Row, Col, Badge, ListGroup, Button, Tab, Tabs } from 'react-bootstrap';
import { FaEdit, FaExchangeAlt, FaDownload, FaFile, FaHistory, FaComment } from 'react-icons/fa';
import { obterProtocolo } from '../../services/protocolos';
import { downloadDocumento } from '../../services/documentos';
import { formatarData, formatarDataHora } from '../../utils/formatters';
import HistoricoMovimentacao from './HistoricoMovimentacao';
import ComentariosProtocolo from './ComentariosProtocolo';

const ProtocoloView = () => {
    const { id } = useParams();
    const [protocolo, setProtocolo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregarProtocolo();
    }, [id]);

    const carregarProtocolo = async () => {
        try {
            setLoading(true);
            const data = await obterProtocolo(id);
            setProtocolo(data);
        } catch (error) {
            console.error('Erro ao carregar protocolo:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (documentoId, nomeArquivo) => {
        try {
            await downloadDocumento(documentoId, nomeArquivo);
        } catch (error) {
            console.error('Erro ao baixar documento:', error);
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
        return <p>Carregando protocolo...</p>;
    }

    if (!protocolo) {
        return <p>Protocolo não encontrado</p>;
    }

    return (
        <div className="protocolo-view">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Protocolo #{protocolo.numero}</h2>
                <div>
                    <Link to={`/protocolos/${id}/editar`} className="btn btn-primary me-2">
                        <FaEdit /> Editar
                    </Link>
                    <Link to={`/protocolos/${id}/movimentar`} className="btn btn-warning">
                        <FaExchangeAlt /> Movimentar
                    </Link>
                </div>
            </div>
            
            <Row>
                <Col md={8}>
                    <Card className="mb-3">
                        <Card.Header>Informações do Protocolo</Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <p><strong>Paciente:</strong> {protocolo.paciente.nome}</p>
                                    <p><strong>CPF:</strong> {protocolo.paciente.cpf}</p>
                                    <p><strong>Data de Nascimento:</strong> {formatarData(protocolo.paciente.data_nascimento)}</p>
                                </Col>
                                <Col md={6}>
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
                                    <p><strong>Setor Atual:</strong> {protocolo.setor_atual}</p>
                                </Col>
                            </Row>
                            
                            <hr />
                            
                            <p><strong>Tipo de Solicitação:</strong> {protocolo.tipo_solicitacao}</p>
                            <p><strong>Data de Entrada:</strong> {formatarDataHora(protocolo.data_entrada)}</p>
                            <p><strong>Descrição:</strong></p>
                            <p className="border p-2 rounded bg-light">{protocolo.descricao}</p>
                        </Card.Body>
                    </Card>
                    
                    <Tabs defaultActiveKey="historico" className="mb-3">
                        <Tab eventKey="historico" title={<><FaHistory /> Histórico</>}>
                            <HistoricoMovimentacao protocoloId={id} />
                        </Tab>
                        <Tab eventKey="comentarios" title={<><FaComment /> Comentários</>}>
                            <ComentariosProtocolo protocoloId={id} />
                        </Tab>
                    </Tabs>
                </Col>
                
                <Col md={4}>
                    <Card className="mb-3">
                        <Card.Header>Documentos Anexados</Card.Header>
                        <Card.Body>
                            {protocolo.documentos && protocolo.documentos.length > 0 ? (
                                <ListGroup>
                                    {protocolo.documentos.map(doc => (
                                        <ListGroup.Item 
                                            key={doc.id}
                                            className="d-flex justify-content-between align-items-center"
                                        >
                                            <div>
                                                <FaFile className="me-2" />
                                                <span>{doc.descricao}</span>
                                            </div>
                                            <Button 
                                                variant="info" 
                                                size="sm"
                                                onClick={() => handleDownload(doc.id, doc.nome_arquivo)}
                                            >
                                                <FaDownload />
                                            </Button>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <p className="text-muted">Nenhum documento anexado</p>
                            )}
                        </Card.Body>
                    </Card>
                    
                    <Card>
                        <Card.Header>Informações Adicionais</Card.Header>
                        <Card.Body>
                            <p><strong>Criado por:</strong> {protocolo.criado_por}</p>
                            <p><strong>Data de Criação:</strong> {formatarDataHora(protocolo.data_criacao)}</p>
                            {protocolo.ultima_atualizacao && (
                                <p><strong>Última Atualização:</strong> {formatarDataHora(protocolo.ultima_atualizacao)}</p>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ProtocoloView;