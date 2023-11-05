import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/');
    };

    return (
        <div>
            <h1>Trang Home</h1>
            <button onClick={handleLogout}>Đăng xuất</button>
        </div>
    );
};

export default Home;
