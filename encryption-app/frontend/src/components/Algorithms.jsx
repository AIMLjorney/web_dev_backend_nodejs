import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Algorithms = () => {
    const [algorithms, setAlgorithms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);

    useEffect(() => {
        fetchAlgorithms();
    }, []);

    const fetchAlgorithms = async () => {
        try {
            const response = await axios.get('/api/encryption/algorithms');
            if (response.data.success) {
                setAlgorithms(response.data.algorithms);
                setSelectedAlgorithm(response.data.algorithms[0]);
            }
        } catch (error) {
            console.error('Failed to fetch algorithms:', error);
        } finally {
            setLoading(false);
        }
    };

    const getAlgorithmIcon = (name) => {
        switch (name) {
            case 'AES': return '🔐';
            case 'DES': return '🗝️';
            case '3DES': return '🔑';
            case 'Blowfish': return '🐠';
            case 'RSA': return '🔒';
            default: return '⚙️';
        }
    };

    const getAlgorithmColor = (name) => {
        switch (name) {
            case 'AES': return 'var(--success-gradient)';
            case 'DES': return 'var(--warning-gradient)';
            case '3DES': return 'var(--secondary-gradient)';
            case 'Blowfish': return 'var(--danger-gradient)';
            case 'RSA': return 'var(--primary-gradient)';
            default: return 'var(--dark-color)';
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    Loading algorithms information...
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="card fade-in">
                <div className="card-header text-center">
                    <h2 className="card-title">⚙️ Encryption Algorithms</h2>
                    <p style={{ color: '#718096', marginTop: '10px' }}>
                        Learn about the encryption algorithms available in CryptoVault
                    </p>
                </div>

                <div className="d-flex gap-3" style={{ flexWrap: 'wrap', minHeight: '400px' }}>
                    {/* Algorithm List */}
                    <div style={{ flex: '1 1 300px' }}>
                        <h4>Available Algorithms</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {algorithms.map((algo) => (
                                <div
                                    key={algo.name}
                                    className="card"
                                    style={{
                                        cursor: 'pointer',
                                        border: selectedAlgorithm?.name === algo.name ? '2px solid #667eea' : '1px solid #e2e8f0',
                                        transition: 'all 0.3s ease',
                                        padding: '15px'
                                    }}
                                    onClick={() => setSelectedAlgorithm(algo)}
                                >
                                    <div className="d-flex align-center gap-3">
                                        <span style={{ fontSize: '24px' }}>
                                            {getAlgorithmIcon(algo.name)}
                                        </span>
                                        <div>
                                            <h4 style={{ margin: 0 }}>{algo.name}</h4>
                                            <p style={{ margin: 0, color: '#718096', fontSize: '14px' }}>
                                                {algo.fullName}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Algorithm Details */}
                    <div style={{ flex: '2 1 400px' }}>
                        {selectedAlgorithm && (
                            <div className="card">
                                <div className="d-flex align-center gap-3 mb-3">
                                    <span style={{ 
                                        fontSize: '48px',
                                        background: getAlgorithmColor(selectedAlgorithm.name),
                                        borderRadius: '50%',
                                        width: '80px',
                                        height: '80px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {getAlgorithmIcon(selectedAlgorithm.name)}
                                    </span>
                                    <div>
                                        <h2 style={{ margin: 0 }}>{selectedAlgorithm.name}</h2>
                                        <p style={{ margin: 0, color: '#718096' }}>
                                            {selectedAlgorithm.fullName}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', margin: '20px 0' }}>
                                    <div style={{ textAlign: 'center', padding: '15px', background: '#f7fafc', borderRadius: '10px' }}>
                                        <strong>Type</strong>
                                        <div style={{ 
                                            color: selectedAlgorithm.type === 'Symmetric' ? '#38a169' : '#3182ce',
                                            fontWeight: 'bold',
                                            marginTop: '5px'
                                        }}>
                                            {selectedAlgorithm.type}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'center', padding: '15px', background: '#f7fafc', borderRadius: '10px' }}>
                                        <strong>Key Size</strong>
                                        <div style={{ fontWeight: 'bold', marginTop: '5px' }}>
                                            {selectedAlgorithm.keySize}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'center', padding: '15px', background: '#f7fafc', borderRadius: '10px' }}>
                                        <strong>Security</strong>
                                        <div style={{ 
                                            color: selectedAlgorithm.name === 'DES' ? '#dd6b20' : '#38a169',
                                            fontWeight: 'bold',
                                            marginTop: '5px'
                                        }}>
                                            {selectedAlgorithm.name === 'DES' ? 'Basic' : 'Strong'}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4>Description</h4>
                                    <p style={{ lineHeight: '1.6' }}>{selectedAlgorithm.description}</p>
                                </div>

                                <div>
                                    <h4>Best Use Cases</h4>
                                    <ul style={{ lineHeight: '1.8', paddingLeft: '20px' }}>
                                        {selectedAlgorithm.name === 'AES' && (
                                            <>
                                                <li>General purpose encryption</li>
                                                <li>File and database encryption</li>
                                                <li>SSL/TLS encryption</li>
                                                <li>Most common encryption needs</li>
                                            </>
                                        )}
                                        {selectedAlgorithm.name === 'DES' && (
                                            <>
                                                <li>Educational purposes</li>
                                                <li>Legacy system compatibility</li>
                                                <li>Basic encryption requirements</li>
                                            </>
                                        )}
                                        {selectedAlgorithm.name === '3DES' && (
                                            <>
                                                <li>Financial applications</li>
                                                <li>Legacy system upgrades</li>
                                                <li>When higher security than DES is needed</li>
                                            </>
                                        )}
                                        {selectedAlgorithm.name === 'Blowfish' && (
                                            <>
                                                <li>Fast encryption of large files</li>
                                                <li>Custom applications</li>
                                                <li>When variable key length is needed</li>
                                            </>
                                        )}
                                        {selectedAlgorithm.name === 'RSA' && (
                                            <>
                                                <li>Secure key exchange</li>
                                                <li>Digital signatures</li>
                                                <li>SSL/TLS handshakes</li>
                                                <li>Asymmetric encryption needs</li>
                                            </>
                                        )}
                                    </ul>
                                </div>

                                <div style={{ marginTop: '20px', padding: '15px', background: '#e6fffa', borderRadius: '8px', borderLeft: '4px solid #38b2ac' }}>
                                    <strong>💡 Recommendation:</strong> {
                                        selectedAlgorithm.name === 'AES' ? 'Use AES for most encryption needs - it offers the best balance of security and performance.' :
                                        selectedAlgorithm.name === 'RSA' ? 'Use RSA for key exchange and digital signatures, but not for large data encryption.' :
                                        'Consider using this algorithm for specific use cases where it has advantages.'
                                    }
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Comparison Table */}
            <div className="card">
                <h3>📊 Algorithm Comparison</h3>
                <div className="history-table">
                    <table style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Algorithm</th>
                                <th>Type</th>
                                <th>Key Size</th>
                                <th>Speed</th>
                                <th>Security</th>
                                <th>Recommendation</th>
                            </tr>
                        </thead>
                        <tbody>
                            {algorithms.map((algo) => (
                                <tr key={algo.name}>
                                    <td>
                                        <strong>{algo.name}</strong>
                                        <br />
                                        <small>{algo.fullName}</small>
                                    </td>
                                    <td>{algo.type}</td>
                                    <td>{algo.keySize}</td>
                                    <td>
                                        {algo.name === 'AES' ? '⭐⭐⭐⭐⭐' :
                                         algo.name === 'DES' ? '⭐⭐⭐⭐⭐' :
                                         algo.name === '3DES' ? '⭐⭐⭐' :
                                         algo.name === 'Blowfish' ? '⭐⭐⭐⭐' :
                                         '⭐'}
                                    </td>
                                    <td>
                                        {algo.name === 'AES' ? '⭐⭐⭐⭐⭐' :
                                         algo.name === 'DES' ? '⭐' :
                                         algo.name === '3DES' ? '⭐⭐⭐' :
                                         algo.name === 'Blowfish' ? '⭐⭐⭐⭐' :
                                         '⭐⭐⭐⭐⭐'}
                                    </td>
                                    <td>
                                        {algo.name === 'AES' ? '✅ Recommended' :
                                         algo.name === 'DES' ? '⚠️ Legacy Only' :
                                         algo.name === '3DES' ? '🔄 Transitional' :
                                         algo.name === 'Blowfish' ? '✅ Good Alternative' :
                                         '✅ For Key Exchange'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Algorithms;