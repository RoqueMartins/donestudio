import React from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../components/Login';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Login
            onLogin={() => navigate('/app')}
            onSignup={() => navigate('/app')}
        />
    );
};

export default LoginPage;
