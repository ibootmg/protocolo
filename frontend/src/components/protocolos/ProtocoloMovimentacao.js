import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { obterProtocolo, movimentarProtocolo } from '../../services/protocolos';

const ProtocoloMovimentacao = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [protocolo, setProtocolo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        setor_destino: '',
        observacao: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        
        try {
            await movimentarProtocolo(id, formData);
            setSuccess(true);
            setTimeout(() => {
                navigate(`/protocolos/${id}`);
            }, 2000);
        } catch (err) {
            setError('Erro ao movimentar protocolo. Verifique os dados e tente novamente.');
            console.error('Erro ao movimentar protocolo:', err);
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

    if (error && !protocolo) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <div className="protocolo-movimentacao">
            <h2>Movimentar Protocolo #{protocolo?.numero}</h2>
            
            {success && (
                <Alert variant="success">
                    Protocolo movimentado com sucesso! Redirecionando...
                </Alert>
            )}
            
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Card className="mb-4">
                <Card.Header>Informações do Protocolo</Card.Header>
                <Card.Body>
                    <p><strong>Paciente:</strong> {protocolo?.paciente?.nome}</p>
                    <p><strong>Tipo:</strong> {protocolo?.tipo_solicitacao}</p>
                    <p><strong>Status Atual:</strong> {protocolo?.status}</p>
                    <p><strong>Setor Atual:</strong> {protocolo?.setor_atual}</p>
                    <p><strong>Última Movimentação:</strong> {protocolo?.ultima_movimentacao}</p>
                </Card.Body>
            </Card>
            
            <Card>
                <Card.Header>Movimentar para outro setor</Card.Header>
                <Card.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Setor de Destino</Form.Label>
                            <Form.Control
                                as="select"
                                name="setor_destino"
                                value={formData.setor_destino}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Selecione o setor</option>
                                <option value="Sala 04">Sala 04</option>
                                <option value="Sala 26">Sala 26</option>
                                <option value="Sala 26A">Sala 26A</option>
                                <option value="Central de Regulação">Central de Regulação</option>
                                <option value="Médico Regulador">Médico Regulador</option>
                                <option value="Setor de Comunicação">Setor de Comunicação</option>
                                <option value="Prestadores externos">Prestadores externos</option>
                            </Form.Control>
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Observação</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="observacao"
                                value={formData.observacao}
                                onChange={handleChange}
                                placeholder="Adicione uma observação sobre esta movimentação"
                            />
                        </Form.Group>
                        
                        <div className="d-flex justify-content-between">
                            <Button 
                                variant="secondary" 
                                onClick={() => navigate(`/protocolos/${id}`)}
                            >
                                Cancelar
                            </Button>
                            <Button 
                                variant="primary" 
                                type="submit"
                                disabled={submitting || !formData.setor_destino}
                            >
                                {submitting ? 'Processando...' : 'Movimentar Protocolo'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default ProtocoloMovimentacao;