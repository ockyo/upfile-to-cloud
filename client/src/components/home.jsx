import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('http://localhost:4000/user-info?email=123@gmail.com', {
                    method: 'GET'
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                
                console.log(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }

        fetchData();
    }, []);
    const navigate = useNavigate();
    const handleLogout = () => {
        navigate('/');
    };

    return (
        <div>
            <h1>HOME PAGE</h1>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Home;
