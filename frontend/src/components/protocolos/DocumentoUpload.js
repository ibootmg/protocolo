import React, { useState } from 'react';
import { Form, Button, ListGroup, Badge } from 'react-bootstrap';
import { FaTrash, FaDownload, FaFile } from 'react-icons/fa';
import { uploadDocumento, excluirDocumento, downloadDocumento } from '../../services/documentos';

const DocumentoUpload = ({ documentos = [], onChange }) => {
    const [uploading, setUploading] = useState(false);
    const [arquivoSelecionado, setArquivoSelecionado] = useState(null);
    const [descricao, setDescricao] = useState('');

    const handleFileChange = (e) => {
        setArquivoSelecionado(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!arquivoSelecionado || !descricao) return;
        
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('arquivo', arquivoSelecionado);
            formData.append('descricao', descricao);
            
            const novoDocumento = await uploadDocumento(formData);
            
            onChange([...documentos, novoDocumento]);
            setArquivoSelecionado(null);
            setDescricao('');
            
            // Resetar o input de arquivo
            document.getElementById('documento-upload').value = '';
        } catch (error) {
            console.error('Erro ao fazer upload:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleExcluir = async (documentoId) => {
        try {
            await excluirDocumento(documentoId);
            const novaLista = documentos.filter(doc => doc.id !== documentoId);
            onChange(novaLista);
        } catch (error) {
            console.error('Erro ao excluir documento:', error);
        }
    };

    const handleDownload = async (documentoId, nomeArquivo) => {
        try {
            await downloadDocumento(documentoId, nomeArquivo);
        } catch (error) {
            console.error('Erro ao baixar documento:', error);
        }
    };

    return (
        <div className="documento-upload">
            <Form.Group className="mb-3">
                <Form.Label>Adicionar Documento</Form.Label>
                <Form.Control
                    type="file"
                    id="documento-upload"
                    onChange={handleFileChange}
                />
            </Form.Group>
            
            <Form.Group className="mb-3">
                <Form.Label>Descrição do Documento</Form.Label>
                <Form.Control
                    type="text"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Ex: Laudo médico, Exame de sangue, etc."
                />
            </Form.Group>
            
            <Button 
                variant="success" 
                onClick={handleUpload}
                disabled={!arquivoSelecionado || !descricao || uploading}
                className="mb-3"
            >
                {uploading ? 'Enviando...' : 'Adicionar Documento'}
            </Button>
            
            <h5>Documentos Anexados</h5>
            {documentos.length === 0 ? (
                <p className="text-muted">Nenhum documento anexado</p>
            ) : (
                <ListGroup>
                    {documentos.map(doc => (
                        <ListGroup.Item 
                            key={doc.id}
                            className="d-flex justify-content-between align-items-center"
                        >
                            <div>
                                <FaFile className="me-2" />
                                <span>{doc.descricao}</span>
                                <Badge bg="secondary" className="ms-2">
                                    {doc.tipo}
                                </Badge>
                            </div>
                            <div>
                                <Button 
                                    variant="info" 
                                    size="sm"
                                    className="me-2"
                                    onClick={() => handleDownload(doc.id, doc.nome_arquivo)}
                                >
                                    <FaDownload />
                                </Button>
                                <Button 
                                    variant="danger" 
                                    size="sm"
                                    onClick={() => handleExcluir(doc.id)}
                                >
                                    <FaTrash />
                                </Button>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </div>
    );
};

export default DocumentoUpload;