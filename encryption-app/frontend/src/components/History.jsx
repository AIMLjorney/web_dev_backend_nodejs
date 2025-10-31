import React, { useState, useEffect } from 'react';
import axios from 'axios';

const History = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current: 1,
        pages: 1,
        total: 0,
        hasNext: false,
        hasPrev: false
    });

    const fetchHistory = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/encryption/history?page=${page}&limit=10`);
            if (response.data.success) {
                setRecords(response.data.records);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch history:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const getOperationIcon = (operation) => {
        return operation === 'encrypt' ? '🔒' : '🔓';
    };

    const getAlgorithmBadgeClass = (algorithm) => {
        return `algorithm-badge ${algorithm.toLowerCase()}`;
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    Loading encryption history...
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="card fade-in">
                <div className="card-header">
                    <h2 className="card-title">📊 Encryption History</h2>
                    <p style={{ color: '#718096', marginTop: '10px' }}>
                        View your recent encryption and decryption activities
                    </p>
                </div>

                {records.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
                        <h3>No history yet</h3>
                        <p style={{ color: '#718096' }}>
                            Start encrypting or decrypting text to see your history here.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="history-table">
                            <table style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th>Operation</th>
                                        <th>Algorithm</th>
                                        <th>Timestamp</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((record) => (
                                        <tr key={record._id}>
                                            <td>
                                                <span style={{ 
                                                    color: record.operation === 'encrypt' ? '#38a169' : '#e53e3e',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {getOperationIcon(record.operation)} 
                                                    {record.operation.toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={getAlgorithmBadgeClass(record.algorithm)}>
                                                    {record.algorithm}
                                                </span>
                                            </td>
                                            <td>{formatDate(record.timestamp)}</td>
                                            <td>
                                                <span style={{ 
                                                    color: '#38a169',
                                                    fontWeight: 'bold'
                                                }}>
                                                    ✅ Completed
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="d-flex justify-between align-center mt-3">
                            <button 
                                className="btn btn-outline"
                                onClick={() => fetchHistory(pagination.current - 1)}
                                disabled={!pagination.hasPrev}
                            >
                                ← Previous
                            </button>
                            
                            <span style={{ color: '#718096' }}>
                                Page {pagination.current} of {pagination.pages} 
                                ({pagination.total} total records)
                            </span>
                            
                            <button 
                                className="btn btn-outline"
                                onClick={() => fetchHistory(pagination.current + 1)}
                                disabled={!pagination.hasNext}
                            >
                                Next →
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Statistics Card */}
            {records.length > 0 && (
                <div className="card">
                    <h4>📈 Statistics</h4>
                    <div className="d-flex gap-3" style={{ flexWrap: 'wrap' }}>
                        <div style={{ 
                            background: 'var(--primary-gradient)', 
                            color: 'white', 
                            padding: '20px', 
                            borderRadius: '10px',
                            flex: '1',
                            minWidth: '200px',
                            textAlign: 'center'
                        }}>
                            <h3>{pagination.total}</h3>
                            <p>Total Operations</p>
                        </div>
                        <div style={{ 
                            background: 'var(--success-gradient)', 
                            color: 'white', 
                            padding: '20px', 
                            borderRadius: '10px',
                            flex: '1',
                            minWidth: '200px',
                            textAlign: 'center'
                        }}>
                            <h3>{records.filter(r => r.operation === 'encrypt').length}</h3>
                            <p>Encryptions</p>
                        </div>
                        <div style={{ 
                            background: 'var(--warning-gradient)', 
                            color: 'white', 
                            padding: '20px', 
                            borderRadius: '10px',
                            flex: '1',
                            minWidth: '200px',
                            textAlign: 'center'
                        }}>
                            <h3>{records.filter(r => r.operation === 'decrypt').length}</h3>
                            <p>Decryptions</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;