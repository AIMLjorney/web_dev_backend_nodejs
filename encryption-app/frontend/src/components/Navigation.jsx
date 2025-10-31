import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const getInitials = (username) => {
        return username ? username.charAt(0).toUpperCase() : 'U';
    };

    const isActiveLink = (path) => {
        return location.pathname === path ? 'nav-link active' : 'nav-link';
    };

    return (
        <nav className="navbar">
            <div className="nav-content">
                <Link to="/" className="nav-brand">
                    🔒 CryptoVault
                </Link>
                
                <div className="nav-links">
                    <Link to="/" className={isActiveLink('/')}>
                        🛠️ Encryption Tool
                    </Link>
                    <Link to="/files" className={isActiveLink('/files')}>
                        📁 File Encryption
                    </Link>
                    <Link to="/history" className={isActiveLink('/history')}>
                        📊 History
                    </Link>
                    <Link to="/algorithms" className={isActiveLink('/algorithms')}>
                        ⚙️ Algorithms
                    </Link>
                    
                    <div className="user-info">
                        <div className="user-avatar">
                            {getInitials(user?.username)}
                        </div>
                        <span>Welcome, {user?.username}</span>
                        <button 
                            onClick={logout}
                            className="btn btn-outline btn-sm"
                        >
                            🚪 Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;