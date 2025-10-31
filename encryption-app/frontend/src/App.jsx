// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { AuthProvider, useAuth } from './context/AuthContext';
// import ProtectedRoute from './components/ProtectedRoute';
// import Navigation from './components/Navigation';
// import Login from './components/Login';
// import Register from './components/Register';
// import EncryptionTool from './components/EncryptionTool';
// import FileEncryption from './components/FileEncryption';
// import History from './components/History';
// import Algorithms from './components/Algorithms';

// function AppContent() {
//     const { user, loading } = useAuth();

//     if (loading) {
//         return (
//             <div className="loading" style={{ height: '100vh' }}>
//                 <div className="loading-spinner"></div>
//                 Loading CryptoVault...
//             </div>
//         );
//     }

//     return (
//         <Router>
//             <div className="App">
//                 {user && <Navigation />}
//                 <Routes>
//                     <Route path="/login" element={
//                         user ? <Navigate to="/" replace /> : <Login />
//                     } />
//                     <Route path="/register" element={
//                         user ? <Navigate to="/" replace /> : <Register />
//                     } />
//                     <Route path="/" element={
//                         <ProtectedRoute>
//                             <EncryptionTool />
//                         </ProtectedRoute>
//                     } />
//                     <Route path="/files" element={
//                         <ProtectedRoute>
//                             <FileEncryption />
//                         </ProtectedRoute>
//                     } />
//                     <Route path="/history" element={
//                         <ProtectedRoute>
//                             <History />
//                         </ProtectedRoute>
//                     } />
//                     <Route path="/algorithms" element={
//                         <ProtectedRoute>
//                             <Algorithms />
//                         </ProtectedRoute>
//                     } />
//                     <Route path="*" element={<Navigate to="/" replace />} />
//                 </Routes>
//             </div>
//         </Router>
//     );
// }

// function App() {
//     return (
//         <AuthProvider>
//             <AppContent />
//         </AuthProvider>
//     );
// }

// export default App;


import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import Login from './components/Login';
import Register from './components/Register';
import EncryptionTool from './components/EncryptionTool';
import FileEncryption from './components/FileEncryption';
import History from './components/History';
import Algorithms from './components/Algorithms';

function AppContent() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading" style={{ height: '100vh' }}>
                <div className="loading-spinner"></div>
                Loading CryptoVault...
            </div>
        );
    }

    return (
        <Router>
            <div className="App">
                {user && <Navigation />}
                <Routes>
                    <Route path="/login" element={
                        user ? <Navigate to="/" replace /> : <Login />
                    } />
                    <Route path="/register" element={
                        user ? <Navigate to="/" replace /> : <Register />
                    } />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <EncryptionTool />
                        </ProtectedRoute>
                    } />
                    <Route path="/files" element={
                        <ProtectedRoute>
                            <FileEncryption />
                        </ProtectedRoute>
                    } />
                    <Route path="/history" element={
                        <ProtectedRoute>
                            <History />
                        </ProtectedRoute>
                    } />
                    <Route path="/algorithms" element={
                        <ProtectedRoute>
                            <Algorithms />
                        </ProtectedRoute>
                    } />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </div>
        </Router>
    );
}

function App() {
    return (
        <AppContent />  
    );
}

export default App;