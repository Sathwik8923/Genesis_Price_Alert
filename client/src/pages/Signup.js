import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
import '../styles/Authentication.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
function Signup() {
    const [signupInfo, setSignupInfo] = useState({ name: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(name, value);
        const copySignupInfo = { ...signupInfo };
        copySignupInfo[name] = value;
        setSignupInfo(copySignupInfo);
    }


    const handleSignup = async (e) => {
        e.preventDefault();
        const { name, email, password } = signupInfo;
        if (!name || !email || !password) {
            return handleError('Name, Email and Password are required')
        }
        try {
            const response = await fetch('/signup', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(signupInfo)
            });
            const result = await response.json();
            const { success, message, error } = result;
            if (success) {
                handleSuccess(message);
                setTimeout(() => {
                    navigate('/login')
                }, 1000)
            } else if (error) {
                const details = error?.details[0].message;
                handleError(details);
            } else if (!success) {
                handleError(message);
            }
            console.log(result);
        } catch (err) {
            handleError(err);
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Join <span className="brand-accent">DealHunt</span></h1>
                    <p>Create an account to start tracking price drops today.</p>
                </div>
                <form className="auth-form" onSubmit={handleSignup}>
                    <div className="auth-input-group">

                        <label>Full Name</label>
                        <div className="auth-input-wrapper">
                            <FontAwesomeIcon icon={faUser} className="auth-input-icon" />
                            <input onChange={handleChange} type='text' name='name' placeholder='John Doe' value={signupInfo.name} />
                        </div>
                    </div>

                    <div className="auth-input-group">
                        <label>Email Address</label>
                        <div className="auth-input-wrapper">
                            <FontAwesomeIcon icon={faEnvelope} className="auth-input-icon" />
                            <input onChange={handleChange} type='email' name='email' placeholder='name@company.com' value={signupInfo.email} />
                        </div>
                    </div>

                    <div className="auth-input-group">
                        <label>Password</label>
                        <div className="auth-input-wrapper">
                            <FontAwesomeIcon icon={faLock} className="auth-input-icon" />
                            <input
                                onChange={handleChange}
                                type={showPassword ? 'text' : 'password'}
                                name='password'
                                placeholder='••••••••'
                                value={signupInfo.password}
                            />
                            <span className="auth-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                            </span>
                        </div>
                    </div>

                    <button className="auth-submit-btn" type="submit">Sign Up</button>

                    <p className="auth-footer">
                        Already have an account? <Link to="/login" className="auth-link">Login</Link>
                    </p>
                </form>
                <ToastContainer />
            </div>
        </div>
    );
}

export default Signup;