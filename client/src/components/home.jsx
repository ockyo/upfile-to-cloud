import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from './upfile';
function Home() {
    const navigate = useNavigate();
    const [username, setName] = useState('unknown')

    const handleLogout = () => {
        fetch('https://localhost:4000/logout', {
            method: 'POST',
            credentials: 'include', // Chắc chắn rằng cookie được gửi đi trong yêu cầu
        })
            .then(response => response.json())
            .then(data => {
                // Kiểm tra đăng xuất thành công
                if (data.message === 'Logout successful') {
                    navigate('/');
                }
            })
            .catch(error => console.error('Error:', error));

    };


    useEffect(() => {
        fetch("https://localhost:4000/user-info", {
            method: 'GET',
            credentials: 'include',
        })
            .then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        setName(data.message);
                    });
                    navigate('/home');
                }
                // else if(response.status===401){
                //     navigate('/');
                // }
                else {
                    navigate('/')
                }
            })
            .catch(err => console.log(err))
    }, [])

    return (
        <div className="container-home" >
            <div className="header">
                <div className="n-left">
                    <div className="n-name">Cloud Fai</div>
                </div>
                <div className="nav-bar">
                    <li>Home</li>
                    <li>About us</li
                    ><button onClick={handleLogout}>Logout</button>
                </div>
            </div>
            <div className="content">
                <h1>Welcome {username}</h1>
            </div>
            <FileUpload />
        </div>
    );
};
export default Home;
