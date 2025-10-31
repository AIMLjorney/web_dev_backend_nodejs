import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');
    
    const { register, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');

        // Check password strength
        if (e.target.name === 'password') {
            checkPasswordStrength(e.target.value);
        }
    };

    const checkPasswordStrength = (password) => {
        let strength = '';
        if (password.length === 0) {
            strength = '';
        } else if (password.length < 6) {
            strength = 'Weak';
        } else if (password.length < 10) {
            strength = 'Medium';
        } else if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
            strength = 'Strong';
        } else {
            strength = 'Good';
        }
        setPasswordStrength(strength);
    };

    const getPasswordStrengthColor = () => {
        switch (passwordStrength) {
            case 'Weak': return '#e53e3e';
            case 'Medium': return '#dd6b20';
            case 'Good': return '#d69e2e';
            case 'Strong': return '#38a169';
            default: return '#cbd5e0';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.username || !formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        const result = await register(formData.username, formData.email, formData.password);
        
        if (result.success) {
            navigate('/', { replace: true });
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="container">
            <div style={{ maxWidth: '450px', margin: '50px auto' }}>
                <div className="card fade-in">
                    <div className="card-header text-center">
                        <h2 className="card-title">Create Account</h2>
                        <p style={{ color: '#718096', marginTop: '10px' }}>Join CryptoVault to start encrypting</p>
                    </div>
                    
                    {error && <div className="alert alert-error">{error}</div>}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input
                                type="text"
                                name="username"
                                className="form-control"
                                placeholder="Choose a username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                        </div>
                        
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
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                disabled={loading}
                            />
                            {passwordStrength && (
                                <div style={{ marginTop: '5px' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        fontSize: '14px'
                                    }}>
                                        <span>Strength:</span>
                                        <span style={{ color: getPasswordStrengthColor(), fontWeight: 'bold' }}>
                                            {passwordStrength}
                                        </span>
                                        <div style={{
                                            flex: 1,
                                            height: '4px',
                                            background: '#e2e8f0',
                                            borderRadius: '2px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: passwordStrength === 'Weak' ? '25%' : 
                                                       passwordStrength === 'Medium' ? '50%' :
                                                       passwordStrength === 'Good' ? '75%' : '100%',
                                                height: '100%',
                                                background: getPasswordStrengthColor(),
                                                transition: 'all 0.3s ease'
                                            }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="form-control"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
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
                                    Creating Account...
                                </>
                            ) : (
                                '🚀 Create Account'
                            )}
                        </button>
                    </form>
                    
                    <div className="text-center mt-3">
                        <p style={{ color: '#718096' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ color: '#667eea', textDecoration: 'none' }}>
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;