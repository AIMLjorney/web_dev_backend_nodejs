import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }

        const result = await login(formData.email, formData.password);
        
        if (result.success) {
            navigate(from, { replace: true });
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    const fillDemoCredentials = () => {
        setFormData({
            email: 'demo@cryptovault.com',
            password: 'demopassword123'
        });
    };

    return (
        <div className="container">
            <div style={{ maxWidth: '400px', margin: '100px auto' }}>
                <div className="card fade-in">
                    <div className="card-header text-center">
                        <h2 className="card-title">Welcome Back</h2>
                        <p style={{ color: '#718096', marginTop: '10px' }}>Sign in to your CryptoVault account</p>
                    </div>
                    
                    {error && <div className="alert alert-error">{error}</div>}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                className="form-control"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password"
                                name="password"
                                className="form-control"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            className="btn btn-primary w-100"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="loading-spinner" style={{ width: '20px', height: '20px', marginRight: '10px' }}></div>
                                    Signing In...
                                </>
                            ) : (
                                '🔐 Sign In'
                            )}
                        </button>

                        <div className="text-center mt-2">
                            <button 
                                type="button" 
                                className="btn btn-outline btn-sm"
                                onClick={fillDemoCredentials}
                            >
                                Try Demo Credentials
                            </button>
                        </div>
                    </form>
                    
                    <div className="text-center mt-3">
                        <p style={{ color: '#718096' }}>
                            Don't have an account?{' '}
                            <Link to="/register" style={{ color: '#667eea', textDecoration: 'none' }}>
                                Create one here
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="card mt-3 text-center">
                    <h4>Demo Account</h4>
                    <p><strong>Email:</strong> demo@cryptovault.com</p>
                    <p><strong>Password:</strong> demopassword123</p>
                    <small style={{ color: '#718096' }}>
                        Use these credentials to test the application
                    </small>
                </div>
            </div>
        </div>
    );
};

export default Login;