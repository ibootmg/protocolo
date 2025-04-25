import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { criarProtocolo, atualizarProtocolo, obterProtocolo } from '../../services/protocolos';

const ProtocoloForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdicao = !!id;
    
    const [formData, setFormData] = useState({
        paciente: {
            nome: '',
            cpf: '',
            data_nascimento: '',
            telefone: ''
        },
        tipo_solicitacao: '',
        prioridade: 'media',
        descricao: '',
        documentos: []
    });
    
    const [loading, setLoading] = useState(isEdicao);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    useEffect(() => {
        if (isEdicao) {
            const fetchProtocolo = async () => {
                try {
                    const data = await obterProtocolo(id);
                    setFormData({
                        paciente: data.paciente,
                        tipo_solicitacao: data.tipo_solicitacao,
                        prioridade: data.prioridade,
                        descricao: data.descricao,
                        documentos: data.documentos || []
                    });
                } catch (err) {
                    setError('Erro ao carregar dados do protocolo.');
                    console.error('Erro ao obter protocolo:', err);
                } finally {
                    setLoading(false);
                }
            };
            
            fetchProtocolo();
        }
    }, [id, isEdicao]);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };
    
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({
            ...prev,
            documentos: [...prev.documentos, ...files]
        }));
    };
    
    const removeDocumento = (index) => {
        setFormData(prev => ({
            ...prev,
            documentos: prev.documentos.filter((_, i) => i !== index)
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        
        try {
            const formDataToSend = new FormData();
            
            // Adicionar dados do paciente
            Object.entries(formData.paciente).forEach(([key, value]) => {
                formDataToSend.append(`paciente.${key}`, value);
            });
            
            // Adicionar outros campos
            formDataToSend.append('tipo_solicitacao', formData.tipo_solicitacao);
            formDataToSend.append('prioridade', formData.prioridade);
            formDataToSend.append('descricao', formData.descricao);
            
            // Adicionar documentos
            formData.documentos.forEach(doc => {
                if (doc instanceof File) {
                    formDataToSend.append('documentos', doc);
                }
            });
            
            if (isEdicao) {
                await atualizarProtocolo(id, formDataToSend);
            } else {
                await criarProtocolo(formDataToSend);
            }
            
            setSuccess(true);
            setTimeout(() => {
                navigate('/protocolos');
            }, 2000);
        } catch (err) {
            setError('Erro ao salvar protocolo. Verifique os dados e tente novamente.');
            console.error('Erro ao salvar protocolo:', err);
        } finally {
            setSubmitting(false);
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
    
    return (
        <div className="protocolo-form">
            <h2>{isEdicao ? 'Editar Protocolo' : 'Novo Protocolo'}</h2>
            
            {success && (
                <Alert variant="success">
                    Protocolo {isEdicao ? 'atualizado' : 'criado'} com sucesso! Redirecionando...
                </Alert>
            )}
            
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form onSubmit={handleSubmit}>
                <Card className="mb-4">
                    <Card.Header>Dados do Paciente</Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Nome Completo</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="paciente.nome"
                                        value={formData.paciente.nome}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>CPF</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="paciente.cpf"
                                        value={formData.paciente.cpf}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Data de Nascimento</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="paciente.data_nascimento"
                                        value={formData.paciente.data_nascimento}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Telefone</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="paciente.telefone"
                                        value={formData.paciente.telefone}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
                
                <Card className="mb-4">
                    <Card.Header>Dados da Solicitação</Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Tipo de Solicitação</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="tipo_solicitacao"
                                        value={formData.tipo_solicitacao}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Selecione o tipo</option>
                                        <option value="consulta">Consulta</option>
                                        <option value="exame">Exame</option>
                                        <option value="procedimento">Procedimento</option>
                                        <option value="cirurgia">Cirurgia</option>
                                        <option value="outro">Outro</option>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Prioridade</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="prioridade"
                                        value={formData.prioridade}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="alta">Alta</option>
                                        <option value="media">Média</option>
                                        <option value="baixa">Baixa</option>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Descrição</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="descricao"
                                value={formData.descricao}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Documentos e Laudos Médicos</Form.Label>
                            <Form.Control
                                type="file"
                                multiple
                                onChange={handleFileChange}
                            />
                            <Form.Text className="text-muted">
                                Você pode anexar múltiplos arquivos (PDF, JPG, PNG)
                            </Form.Text>
                        </Form.Group>
                        
                        {formData.documentos.length > 0 && (
                            <div className="mt-3">
                                <h6>Documentos Anexados:</h6>
                                <ul className="list-group">
                                    {formData.documentos.map((doc, index) => (
                                        <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                            {doc.name || doc}
                                            <Button 
                                                variant="danger" 
                                                size="sm"
                                                onClick={() => removeDocumento(index)}
                                            >
                                                Remover
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </Card.Body>
                </Card>
                
                <div className="d-flex justify-content-between">
                    <Button 
                        variant="secondary" 
                        onClick={() => navigate('/protocolos')}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        variant="primary" 
                        type="submit"
                        disabled={submitting}
                    >
                        {submitting ? 'Salvando...' : (isEdicao ? 'Atualizar Protocolo' : 'Criar Protocolo')}
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default ProtocoloForm;