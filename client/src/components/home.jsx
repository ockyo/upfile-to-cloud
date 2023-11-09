import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
    const navigate = useNavigate();
    const handleLogout = () => {
        navigate('/');
    };
    const [name, setName] = useState('unknown')
    useEffect(() => {
        fetch("https://localhost:4000/user-info")
            .then(response => {
                 if (response.valid === true) {
                    setName(response.username);
                }
                else {
                    navigate('/');
                }
            })
            // .then(data => {
            //     if (data.valid === true) {
            //         setName(data.username);
            //         navigate('/');
            //     }
            //     else {
            //         navigate('/');
            //     }
            // })
            .catch(err => console.log(err))
    }, [])

    return (
        <div>

            <h1>HOME PAGE</h1>
            <h1>Welcome {name}</h1>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Home;
