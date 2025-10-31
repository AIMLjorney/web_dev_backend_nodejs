import React, { useState } from 'react';
import axios from 'axios';

const FileEncryption = () => {
    const [file, setFile] = useState(null);
    const [algorithm, setAlgorithm] = useState('AES');
    const [key, setKey] = useState('');
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [userFiles, setUserFiles] = useState([]);
    const [loadingFiles, setLoadingFiles] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
                setError('File size must be less than 10MB');
                return;
            }
            setFile(selectedFile);
            setError('');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            if (droppedFile.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }
            setFile(droppedFile);
            setError('');
        }
    };

    const generateKey = async () => {
        try {
            const response = await axios.post('/api/encryption/generate-key', {
                algorithm: algorithm
            });
            
            if (response.data.success) {
                setKey(response.data.key);
            }
        } catch {
            setError('Failed to generate key');
        }
    };

    const encryptFile = async () => {
        if (!file || !key) {
            setError('Please select a file and provide an encryption key');
            return;
        }

        setUploading(true);
        setError('');
        setResult(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('algorithm', algorithm);
        formData.append('key', key);

        try {
            const response = await axios.post('/api/files/upload-encrypt', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: () => {
                    // You could add a progress bar here
                }
            });

            if (response.data.success) {
                setResult(response.data);
                setFile(null);
                document.getElementById('file-input').value = '';
                fetchUserFiles(); // Refresh file list
            } else {
                setError(response.data.message);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'File upload failed');
        } finally {
            setUploading(false);
        }
    };

    const fetchUserFiles = async () => {
        setLoadingFiles(true);
        try {
            const response = await axios.get('/api/files/my-files');
            if (response.data.success) {
                setUserFiles(response.data.files);
            }
        } catch (error) {
            console.error('Failed to fetch files:', error);
        } finally {
            setLoadingFiles(false);
        }
    };

    const downloadFile = async (fileId, fileName) => {
        const downloadKey = prompt(`Enter decryption key for ${fileName}:`);
        if (!downloadKey) return;

        try {
            const response = await axios.get(`/api/files/download/${fileId}?key=${downloadKey}`, {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert('Download failed: ' + (error.response?.data?.message || 'Invalid key or file error'));
        }
    };

    const deleteFile = async (fileId, fileName) => {
        if (!confirm(`Are you sure you want to delete ${fileName}?`)) return;

        try {
            const response = await axios.delete(`/api/files/${fileId}`);
            if (response.data.success) {
                fetchUserFiles(); // Refresh list
                alert('File deleted successfully');
            }
        } catch (error) {
            alert('Delete failed: ' + (error.response?.data?.message || 'Server error'));
        }
    };

    // Load user files on component mount
    React.useEffect(() => {
        fetchUserFiles();
    }, []);

    return (
        <div className="container">
            <div className="card fade-in">
                <div className="card-header">
                    <h2 className="card-title">📁 File Encryption</h2>
                    <p style={{ color: '#718096', marginTop: '10px' }}>
                        Encrypt your files securely. Supported formats: PDF, Images, Documents, Text files
                    </p>
                </div>

                {error && <div className="alert alert-error">{error}</div>}
                {result && (
                    <div className="alert alert-success">
                        <h4>✅ {result.message}</h4>
                        <pre>{JSON.stringify(result.fileInfo, null, 2)}</pre>
                        <p>Download URL: {result.downloadUrl}</p>
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label">Select Algorithm</label>
                    <select 
                        className="form-control"
                        value={algorithm}
                        onChange={(e) => setAlgorithm(e.target.value)}
                    >
                        <option value="AES-128">AES-128 (128-bit)</option>
                         <option value="AES-192">AES-192 (192-bit)</option>
                         <option value="AES-256">AES-256 (256-bit, Recommended)</option>
                         <option value="DES">DES</option>
                         <option value="3DES">3DES</option>
                         <option value="Blowfish">Blowfish</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Encryption Key</label>
                    <div className="d-flex gap-2">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter encryption key"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                        />
                        <button type="button" className="btn btn-success" onClick={generateKey}>
                            🎲 Generate Key
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Select File (Max 10MB)</label>
                    <div 
                        className="file-upload"
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-input').click()}
                    >
                        <input
                            id="file-input"
                            type="file"
                            className="file-input"
                            onChange={handleFileChange}
                        />
                        <div style={{ fontSize: '48px', marginBottom: '15px' }}>📎</div>
                        <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>
                            {file ? file.name : 'Choose a file or drag it here'}
                        </p>
                        <p style={{ color: '#718096', fontSize: '14px' }}>
                            Click to select or drag and drop your file here
                        </p>
                    </div>
                    
                    {file && (
                        <div className="file-info">
                            <p><strong>File Name:</strong> {file.name}</p>
                            <p><strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            <p><strong>Type:</strong> {file.type || 'Unknown'}</p>
                        </div>
                    )}
                </div>

                <button 
                    className="btn btn-primary btn-lg w-100"
                    onClick={encryptFile}
                    disabled={uploading || !file || !key}
                >
                    {uploading ? (
                        <>
                            <div className="loading-spinner" style={{ width: '20px', height: '20px', marginRight: '10px' }}></div>
                            Encrypting...
                        </>
                    ) : (
                        '🔒 Encrypt File'
                    )}
                </button>
            </div>

            {/* User's Encrypted Files */}
            <div className="card">
                <div className="card-header">
                    <h3>Your Encrypted Files</h3>
                    <button 
                        className="btn btn-outline btn-sm"
                        onClick={fetchUserFiles}
                        disabled={loadingFiles}
                    >
                        {loadingFiles ? '🔄 Refreshing...' : '🔄 Refresh'}
                    </button>
                </div>

                {loadingFiles ? (
                    <div className="loading">
                        <div className="loading-spinner"></div>
                        Loading files...
                    </div>
                ) : userFiles.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#718096', padding: '40px' }}>
                        No encrypted files yet. Upload a file to get started!
                    </p>
                ) : (
                    <div className="history-table">
                        <table style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th>File Name</th>
                                    <th>Algorithm</th>
                                    <th>Size</th>
                                    <th>Upload Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userFiles.map((file) => (
                                    <tr key={file._id}>
                                        <td>{file.originalName}</td>
                                        <td>
                                            <span className={`algorithm-badge ${file.algorithm.toLowerCase()}`}>
                                                {file.algorithm}
                                            </span>
                                        </td>
                                        <td>{(file.size / 1024).toFixed(2)} KB</td>
                                        <td>{new Date(file.uploadDate).toLocaleDateString()}</td>
                                        <td>
                                            <div className="d-flex gap-1">
                                                <button 
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => downloadFile(file._id, file.originalName)}
                                                >
                                                    📥 Download
                                                </button>
                                                <button 
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => deleteFile(file._id, file.originalName)}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileEncryption;

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const FileEncryption = () => {
//     const [file, setFile] = useState(null);
//     const [algorithm, setAlgorithm] = useState('AES-256');
//     const [key, setKey] = useState('');
//     const [uploading, setUploading] = useState(false);
//     const [result, setResult] = useState(null);
//     const [error, setError] = useState('');
//     const [userFiles, setUserFiles] = useState([]);
//     const [loadingFiles, setLoadingFiles] = useState(false);

//     const handleFileChange = (e) => {
//         const selectedFile = e.target.files[0];
//         if (selectedFile) {
//             if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
//                 setError('File size must be less than 10MB');
//                 return;
//             }
//             setFile(selectedFile);
//             setError('');
//         }
//     };

//     const handleDragOver = (e) => {
//         e.preventDefault();
//         e.currentTarget.classList.add('dragover');
//     };

//     const handleDragLeave = (e) => {
//         e.preventDefault();
//         e.currentTarget.classList.remove('dragover');
//     };

//     const handleDrop = (e) => {
//         e.preventDefault();
//         e.currentTarget.classList.remove('dragover');
//         const droppedFile = e.dataTransfer.files[0];
//         if (droppedFile) {
//             if (droppedFile.size > 10 * 1024 * 1024) {
//                 setError('File size must be less than 10MB');
//                 return;
//             }
//             setFile(droppedFile);
//             setError('');
//         }
//     };

//     const generateKey = async () => {
//         try {
//             const response = await axios.post('/api/encryption/generate-key', {
//                 algorithm: algorithm
//             });
            
//             if (response.data.success) {
//                 setKey(response.data.key);
//             }
//         } catch {
//             setError('Failed to generate key');
//         }
//     };

//     const encryptFile = async () => {
//         if (!file || !key) {
//             setError('Please select a file and provide an encryption key');
//             return;
//         }

//         setUploading(true);
//         setError('');
//         setResult(null);

//         const formData = new FormData();
//         formData.append('file', file);
//         formData.append('algorithm', algorithm);
//         formData.append('key', key);

//         try {
//             const response = await axios.post('/api/files/upload-encrypt', formData, {
//                 headers: {
//                     'Content-Type': 'multipart/form-data'
//                 },
//                 onUploadProgress: () => {
//                     // You could add a progress bar here
//                 }
//             });

//             if (response.data.success) {
//                 setResult(response.data);
//                 setFile(null);
//                 document.getElementById('file-input').value = '';
//                 fetchUserFiles(); // Refresh file list
//             } else {
//                 setError(response.data.message);
//             }
//         } catch (error) {
//             setError(error.response?.data?.message || 'File upload failed');
//         } finally {
//             setUploading(false);
//         }
//     };

//     const fetchUserFiles = async () => {
//         setLoadingFiles(true);
//         try {
//             const response = await axios.get('/api/files/my-files');
//             if (response.data.success) {
//                 setUserFiles(response.data.files);
//             }
//         } catch (error) {
//             console.error('Failed to fetch files:', error);
//         } finally {
//             setLoadingFiles(false);
//         }
//     };

//     const downloadFile = async (fileId, fileName) => {
//         const downloadKey = prompt(`Enter decryption key for ${fileName}:`);
//         if (!downloadKey) return;

//         try {
//             const response = await axios.get(`/api/files/download/${fileId}?key=${downloadKey}`, {
//                 responseType: 'blob'
//             });

//             // Create download link
//             const url = window.URL.createObjectURL(new Blob([response.data]));
//             const link = document.createElement('a');
//             link.href = url;
//             link.setAttribute('download', fileName);
//             document.body.appendChild(link);
//             link.click();
//             link.remove();
//             window.URL.revokeObjectURL(url);
//         } catch (error) {
//             alert('Download failed: ' + (error.response?.data?.message || 'Invalid key or file error'));
//         }
//     };

//     // Add this function to handle saving encrypted files
//     const saveEncryptedFile = async (fileId, fileName) => {
//         try {
//             const response = await axios.get(`/api/files/save/${fileId}`, {
//                 responseType: 'blob'
//             });

//             // Create download link for encrypted file
//             const url = window.URL.createObjectURL(new Blob([response.data]));
//             const link = document.createElement('a');
//             link.href = url;
//             link.setAttribute('download', `encrypted-${fileName}.enc`);
//             document.body.appendChild(link);
//             link.click();
//             link.remove();
//             window.URL.revokeObjectURL(url);
            
//             alert('Encrypted file saved successfully!');
//         } catch (error) {
//             alert('Save failed: ' + (error.response?.data?.message || 'Server error'));
//         }
//     };

//     const deleteFile = async (fileId, fileName) => {
//         if (!confirm(`Are you sure you want to delete ${fileName}?`)) return;

//         try {
//             const response = await axios.delete(`/api/files/${fileId}`);
//             if (response.data.success) {
//                 fetchUserFiles(); // Refresh list
//                 alert('File deleted successfully');
//             }
//         } catch (error) {
//             alert('Delete failed: ' + (error.response?.data?.message || 'Server error'));
//         }
//     };

//     // Load user files on component mount
//     useEffect(() => {
//         fetchUserFiles();
//     }, []);

//     return (
//         <div className="container">
//             <div className="card fade-in">
//                 <div className="card-header">
//                     <h2 className="card-title">📁 File Encryption</h2>
//                     <p style={{ color: '#718096', marginTop: '10px' }}>
//                         Encrypt your files securely. Supported formats: PDF, Images, Documents, Text files
//                     </p>
//                 </div>

//                 {error && <div className="alert alert-error">{error}</div>}
//                 {result && (
//                     <div className="alert alert-success">
//                         <h4>✅ {result.message}</h4>
//                         <pre>{JSON.stringify(result.fileInfo, null, 2)}</pre>
//                         <p>Download URL: {result.downloadUrl}</p>
//                     </div>
//                 )}

//                 <div className="form-group">
//                     <label className="form-label">Select Algorithm</label>
//                     <select 
//                         className="form-control"
//                         value={algorithm}
//                         onChange={(e) => setAlgorithm(e.target.value)}
//                     >
//                         <option value="AES-128">AES-128 (128-bit)</option>
//                         <option value="AES-192">AES-192 (192-bit)</option>
//                         <option value="AES-256">AES-256 (256-bit, Recommended)</option>
//                         <option value="DES">DES</option>
//                         <option value="3DES">3DES</option>
//                         <option value="Blowfish">Blowfish</option>
//                     </select>
//                 </div>

//                 <div className="form-group">
//                     <label className="form-label">Encryption Key</label>
//                     <div className="d-flex gap-2">
//                         <input
//                             type="text"
//                             className="form-control"
//                             placeholder="Enter encryption key"
//                             value={key}
//                             onChange={(e) => setKey(e.target.value)}
//                         />
//                         <button type="button" className="btn btn-success" onClick={generateKey}>
//                             🎲 Generate Key
//                         </button>
//                     </div>
//                     <small style={{ color: '#718096', marginTop: '5px', display: 'block' }}>
//                         {algorithm === 'AES-128' && 'Key should be 16 characters (128-bit)'}
//                         {algorithm === 'AES-192' && 'Key should be 24 characters (192-bit)'}
//                         {algorithm === 'AES-256' && 'Key should be 32 characters (256-bit)'}
//                         {algorithm === 'DES' && 'Key should be 8 characters (64-bit)'}
//                         {algorithm === '3DES' && 'Key should be 24 characters (192-bit)'}
//                         {algorithm === 'Blowfish' && 'Key can be 4-56 characters (32-448-bit)'}
//                     </small>
//                 </div>

//                 <div className="form-group">
//                     <label className="form-label">Select File (Max 10MB)</label>
//                     <div 
//                         className="file-upload"
//                         onDragOver={handleDragOver}
//                         onDragLeave={handleDragLeave}
//                         onDrop={handleDrop}
//                         onClick={() => document.getElementById('file-input').click()}
//                     >
//                         <input
//                             id="file-input"
//                             type="file"
//                             className="file-input"
//                             onChange={handleFileChange}
//                         />
//                         <div style={{ fontSize: '48px', marginBottom: '15px' }}>📎</div>
//                         <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>
//                             {file ? file.name : 'Choose a file or drag it here'}
//                         </p>
//                         <p style={{ color: '#718096', fontSize: '14px' }}>
//                             Click to select or drag and drop your file here
//                         </p>
//                     </div>
                    
//                     {file && (
//                         <div className="file-info">
//                             <p><strong>File Name:</strong> {file.name}</p>
//                             <p><strong>Size:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
//                             <p><strong>Type:</strong> {file.type || 'Unknown'}</p>
//                         </div>
//                     )}
//                 </div>

//                 <button 
//                     className="btn btn-primary btn-lg w-100"
//                     onClick={encryptFile}
//                     disabled={uploading || !file || !key}
//                 >
//                     {uploading ? (
//                         <>
//                             <div className="loading-spinner" style={{ width: '20px', height: '20px', marginRight: '10px' }}></div>
//                             Encrypting...
//                         </>
//                     ) : (
//                         '🔒 Encrypt File'
//                     )}
//                 </button>
//             </div>

//             {/* User's Encrypted Files */}
//             <div className="card">
//                 <div className="card-header">
//                     <h3>Your Encrypted Files</h3>
//                     <button 
//                         className="btn btn-outline btn-sm"
//                         onClick={fetchUserFiles}
//                         disabled={loadingFiles}
//                     >
//                         {loadingFiles ? '🔄 Refreshing...' : '🔄 Refresh'}
//                     </button>
//                 </div>

//                 {loadingFiles ? (
//                     <div className="loading">
//                         <div className="loading-spinner"></div>
//                         Loading files...
//                     </div>
//                 ) : userFiles.length === 0 ? (
//                     <p style={{ textAlign: 'center', color: '#718096', padding: '40px' }}>
//                         No encrypted files yet. Upload a file to get started!
//                     </p>
//                 ) : (
//                     <div className="history-table">
//                         <table style={{ width: '100%' }}>
//                             <thead>
//                                 <tr>
//                                     <th>File Name</th>
//                                     <th>Algorithm</th>
//                                     <th>Size</th>
//                                     <th>Upload Date</th>
//                                     <th>Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {userFiles.map((file) => (
//                                     <tr key={file._id}>
//                                         <td>{file.originalName}</td>
//                                         <td>
//                                             <span className={`algorithm-badge ${file.algorithm.toLowerCase()}`}>
//                                                 {file.algorithm}
//                                             </span>
//                                         </td>
//                                         <td>{(file.size / 1024).toFixed(2)} KB</td>
//                                         <td>{new Date(file.uploadDate).toLocaleDateString()}</td>
//                                         <td>
//                                             <div className="d-flex gap-1">
//                                                 <button 
//                                                     className="btn btn-success btn-sm"
//                                                     onClick={() => downloadFile(file._id, file.originalName)}
//                                                 >
//                                                     📥 Download
//                                                 </button>
//                                                 <button 
//                                                     className="btn btn-info btn-sm"
//                                                     onClick={() => saveEncryptedFile(file._id, file.originalName)}
//                                                 >
//                                                     💾 Save Encrypted
//                                                 </button>
//                                                 <button 
//                                                     className="btn btn-danger btn-sm"
//                                                     onClick={() => deleteFile(file._id, file.originalName)}
//                                                 >
//                                                     🗑️ Delete
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default FileEncryption;