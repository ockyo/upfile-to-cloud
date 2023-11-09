import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Home from './home';

export default function Login() {
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [isRegistering, setRegistering] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const handleToggle = () => {
        setRegistering(!isRegistering);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Thay đổi URL để sử dụng HTTPS
        const url = isRegistering ? 'https://localhost:4000/register' : 'https://localhost:4000/login';

        fetch(url, {
            method: 'POST',
            body: JSON.stringify(formData),
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then((response) => {
                if (isRegistering) {
                    // Đăng ký thành công

                    navigate('/home');
                } else if (response.status === 401) {
                    // Đăng nhập không thành công, hiển thị thông báo lỗi
                    response.json().then(data => {
                        setError(data.message);

                    });
                } else {
                    response.json().then(data => {
                        console.log(data.username)
                    });
                    navigate('/home');
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

    return (
        <div>
            <div className={`container ${isRegistering ? 'active' : ''}`} id="container">
                <div className="form-container sign-up">
                    <form id="signup-form" onSubmit={handleSubmit}>
                        <h1>{isRegistering ? 'Create Account' : 'Sign In'}</h1>
                        <div className="social-icons">
                            <a href="#" className="icon"><i className="fa-brands fa-google-plus-g"></i></a>
                            <a href="#" className="icon"><i className="fa-brands fa-facebook-f"></i></a>
                            <a href="#" className="icon"><i className="fa-brands fa-github"></i></a>
                            <a href="#" className="icon"><i className="fa-brands fa-linkedin-in"></i></a>
                        </div>
                        <span>or use your email for {isRegistering ? 'registration' : 'sign in'}</span>
                        {isRegistering && (
                            <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} />
                        )}
                        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
                        <button type="submit">{isRegistering ? 'Sign Up' : 'Sign In'}</button>
                    </form>
                </div>
                <div className="form-container sign-in">
                    <form id="login-form" onSubmit={handleSubmit}>
                        <h1>Sign In</h1>
                        <div className="social-icons">
                            <a href="#" className="icon"><i className="fa-brands fa-google-plus-g"></i></a>
                            <a href="#" className="icon"><i className="fa-brands fa-facebook-f"></i></a>
                            <a href="#" className="icon"><i className="fa-brands fa-github"></i></a>
                            <a href="#" className="icon"><i className="fa-brands fa-linkedin-in"></i></a>
                        </div>
                        <span>or use your email and password</span>
                        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
                        <a href="#">Forget Your Password?</a>
                        <button type="submit">Sign In</button>
                    </form>
                    {error && <p>{error}</p>}
                </div>
                <div className="toggle-container">
                    <div className="toggle">
                        <div className={`toggle-panel toggle-left ${isRegistering ? 'hidden1' : ''}`}>
                            <h1>Welcome Back!</h1>
                            <p>Enter your personal details to use all site features</p>
                            <button onClick={handleToggle}>Sign In</button>
                        </div>
                        <div className={`toggle-panel toggle-right ${isRegistering ? '' : 'hidden1'}`}>
                            <h1>Hello, Friend!</h1>
                            <p>Register with your personal details to use all site features</p>
                            <button onClick={handleToggle}>Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
