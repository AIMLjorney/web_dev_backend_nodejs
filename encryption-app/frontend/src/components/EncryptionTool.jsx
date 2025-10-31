import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EncryptionTool = () => {
    const [formData, setFormData] = useState({
        algorithm: 'AES',
        operation: 'encrypt',
        text: '',
        key: '',
        privateKey: ''
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [algorithms, setAlgorithms] = useState([]);

    useEffect(() => {
        fetchAlgorithms();
    }, []);

    const fetchAlgorithms = async () => {
        try {
            const response = await axios.get('/api/encryption/algorithms');
            if (response.data.success) {
                setAlgorithms(response.data.algorithms);
            }
        } catch {
            console.error('Failed to fetch algorithms');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
        setResult(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const endpoint = formData.operation === 'encrypt' ? '/encrypt' : '/decrypt';
            const payload = {
                algorithm: formData.algorithm,
                [formData.operation === 'encrypt' ? 'text' : 'encryptedData']: formData.text,
                key: formData.key
            };

            if (formData.algorithm === 'RSA' && formData.operation === 'decrypt') {
                payload.privateKey = formData.privateKey;
            }

            const response = await axios.post(`/api/encryption${endpoint}`, payload);
            
            if (response.data.success) {
                setResult(response.data);
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Operation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const generateKey = async () => {
        try {
            const response = await axios.post('/api/encryption/generate-key', {
                algorithm: formData.algorithm
            });
            
            if (response.data.success) {
                setFormData(prev => ({
                    ...prev,
                    key: response.data.key
                }));
            }
        } catch {
            setError('Failed to generate key');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            // You could add a toast notification here
            alert('Copied to clipboard!');
        });
    };

    const clearAll = () => {
        setFormData({
            algorithm: 'AES',
            operation: 'encrypt',
            text: '',
            key: '',
            privateKey: ''
        });
        setResult(null);
        setError('');
    };

    const getAlgorithmInfo = () => {
        return algorithms.find(algo => algo.name === formData.algorithm) || {};
    };

    const algorithmInfo = getAlgorithmInfo();

    return (
        <div className="container">
            <div className="card fade-in">
                <div className="card-header">
                    <h2 className="card-title">🔐 Encryption & Decryption Tool</h2>
                    <p style={{ color: '#718096', marginTop: '10px' }}>
                        Secure your data with military-grade encryption algorithms
                    </p>
                </div>
                
                {error && <div className="alert alert-error">{error}</div>}
                
                {result && (
                    <div className="alert alert-success">
                        <h4>✅ {result.message}</h4>
                        <div className="code-block">
                            <pre>{JSON.stringify(result, null, 2)}</pre>
                            <button 
                                className="copy-btn"
                                onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                            >
                                📋 Copy
                            </button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="d-flex gap-3" style={{ flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ flex: '1 1 300px' }}>
                            <label className="form-label">Encryption Algorithm</label>
                            {/* <select 
                                name="algorithm" 
                                className="form-control"
                                value={formData.algorithm}
                                onChange={handleChange}
                            >
                                <option value="AES">AES (Advanced Encryption Standard)</option>
                                <option value="DES">DES (Data Encryption Standard)</option>
                                <option value="3DES">3DES (Triple DES)</option>
                                <option value="Blowfish">Blowfish</option>
                                <option value="RSA">RSA (Asymmetric)</option>
                            </select> */}

                            // In the algorithm select, update options:
                            {<select 
                                name="algorithm" 
                                className="form-control"
                                value={formData.algorithm}
                                onChange={handleChange}
                            >
                              <option value="AES-128">AES-128 (128-bit)</option>
                              <option value="AES-192">AES-192 (192-bit)</option>
                              <option value="AES-256">AES-256 (256-bit, Recommended)</option>
                              <option value="DES">DES (Data Encryption Standard)</option>
                              <option value="3DES">3DES (Triple DES)</option>
                              <option value="Blowfish">Blowfish</option>
                              <option value="RSA">RSA (Asymmetric)</option>
                            </select>}
                            
                            {algorithmInfo && (
                                <div style={{ marginTop: '10px', padding: '10px', background: '#f7fafc', borderRadius: '5px', fontSize: '14px' }}>
                                    <strong>Type:</strong> {algorithmInfo.type} | 
                                    <strong> Key Size:</strong> {algorithmInfo.keySize}
                                    <br />
                                    {algorithmInfo.description}
                                </div>
                            )}
                        </div>

                        <div className="form-group" style={{ flex: '1 1 300px' }}>
                            <label className="form-label">Operation Type</label>
                            <div className="radio-group">
                                <label>
                                    <input
                                        type="radio"
                                        name="operation"
                                        value="encrypt"
                                        checked={formData.operation === 'encrypt'}
                                        onChange={handleChange}
                                    />
                                    🔒 Encrypt
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="operation"
                                        value="decrypt"
                                        checked={formData.operation === 'decrypt'}
                                        onChange={handleChange}
                                    />
                                    🔓 Decrypt
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            {formData.operation === 'encrypt' ? '📝 Text to Encrypt' : '🔍 Text to Decrypt'}
                        </label>
                        <textarea
                            name="text"
                            className="form-control"
                            value={formData.text}
                            onChange={handleChange}
                            placeholder={
                                formData.operation === 'encrypt' 
                                    ? 'Enter your sensitive text here...' 
                                    : 'Paste your encrypted text here...'
                            }
                            required
                            rows="6"
                        />
                    </div>

                    <div className="d-flex gap-3" style={{ flexWrap: 'wrap' }}>
                        <div className="form-group" style={{ flex: '1 1 300px' }}>
                            <label className="form-label">
                                {formData.algorithm === 'RSA' && formData.operation === 'encrypt' 
                                    ? '🔑 RSA Key Pair Will Be Generated' 
                                    : '🔑 Encryption Key'
                                }
                            </label>
                            <div className="d-flex gap-2">
                                <input
                                    type="text"
                                    name="key"
                                    className="form-control"
                                    value={formData.key}
                                    onChange={handleChange}
                                    placeholder={
                                        formData.algorithm === 'RSA' && formData.operation === 'encrypt'
                                            ? 'RSA keys will be generated automatically'
                                            : 'Enter your encryption key'
                                    }
                                    required={formData.algorithm !== 'RSA' || formData.operation !== 'encrypt'}
                                    disabled={formData.algorithm === 'RSA' && formData.operation === 'encrypt'}
                                    style={{ flex: 1 }}
                                />
                                <button 
                                    type="button" 
                                    className="btn btn-success"
                                    onClick={generateKey}
                                    disabled={formData.algorithm === 'RSA' && formData.operation === 'encrypt'}
                                >
                                    🎲 Generate
                                </button>
                            </div>
                        </div>

                        {formData.algorithm === 'RSA' && formData.operation === 'decrypt' && (
                            <div className="form-group" style={{ flex: '1 1 300px' }}>
                                <label className="form-label">🔒 RSA Private Key</label>
                                <textarea
                                    name="privateKey"
                                    className="form-control"
                                    value={formData.privateKey}
                                    onChange={handleChange}
                                    placeholder="Paste your RSA private key here"
                                    required
                                    rows="3"
                                />
                            </div>
                        )}
                    </div>

                    <div className="d-flex gap-2 justify-between">
                        <button 
                            type="submit" 
                            className="btn btn-primary btn-lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="loading-spinner" style={{ width: '20px', height: '20px', marginRight: '10px' }}></div>
                                    Processing...
                                </>
                            ) : (
                                formData.operation === 'encrypt' ? '🔒 Encrypt' : '🔓 Decrypt'
                            )}
                        </button>
                        
                        <button 
                            type="button" 
                            className="btn btn-outline"
                            onClick={clearAll}
                        >
                            🗑️ Clear All
                        </button>
                    </div>
                </form>
            </div>

            {/* Quick Tips Card */}
            <div className="card">
                <h4>💡 Quick Tips</h4>
                <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                    <li>Use AES for most encryption needs - it's fast and secure</li>
                    <li>RSA is great for secure key exchange but slower for large data</li>
                    <li>Always store your keys securely - we don't save them</li>
                    <li>Use the key generator for strong, random keys</li>
                    <li>Test encryption/decryption with small text first</li>
                </ul>
            </div>
        </div>
    );
};

export default EncryptionTool;