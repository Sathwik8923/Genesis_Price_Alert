import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
import '../styles/Authentication.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faEye, faEyeSlash, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
function Login() {
    const [loginInfo, setLoginInfo] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(name, value);
        const copyLoginInfo = { ...loginInfo };
        copyLoginInfo[name] = value;
        setLoginInfo(copyLoginInfo);
    }
    const handleLogin = async (e) => {
        e.preventDefault();
        const { email, password } = loginInfo;
        if (!email || !password) {
            return handleError('email and password are required')
        }
        try {
            const response = await fetch('/login', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginInfo)
            });
            const result = await response.json();
            const { success, message, jwtToken, name, error } = result;

            if (success) {
                handleSuccess(message);
                localStorage.setItem('token', jwtToken);
                localStorage.setItem('loggedInUser', name);
                setTimeout(() => {
                    navigate('/home')
                }, 1000)
            }

            if (error) {
                const details = error?.details[0].message;
                handleError(details);
            } else if (!success) {
                handleError(message);
            }
            console.log(result);
        } catch (err) {
            handleError("Something went wrong. Please try again.");
        }
    }
    const handleResendLink = async () => {
        try {
            const response = await fetch('/resend', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: loginInfo.email })
            });

            const result = await response.json();
            if (response.ok) {
                handleSuccess("Verification email sent! Please check your inbox.");
            } else {
                handleError(result.message || "Failed to resend email.");
            }
        } catch (err) {
            handleError("An error occurred. Please try again.");
        }
    };
    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Welcome to <span className="brand-accent">DealHunt</span></h1>
                    <p>Login to see the lowest prices from 50+ stores.</p>
                </div>
                <form className="auth-form" onSubmit={handleLogin}>
                    <div className="auth-input-group">
                        <label>Email Address</label>
                        <div className="auth-input-wrapper">
                            <FontAwesomeIcon icon={faEnvelope} className="auth-input-icon" />
                            <input
                                onChange={handleChange}
                                type='email'
                                name='email'
                                placeholder='name@company.com'
                                value={loginInfo.email}
                            />
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
                                value={loginInfo.password}
                            />
                            <span className="auth-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                            </span>

                        </div>
                    </div>
                    <div className="flex justify-end -mt-2">
                        <Link to="/forgot-password" size="sm" className="text-emerald-600 hover:text-emerald-700 text-sm font-bold no-underline">
                            Forgot Password?
                        </Link>
                    </div>
                    <button className="auth-submit-btn" type="submit">Log In</button>

                    <div className="mt-4 text-center">
                        <span className="text-slate-600 dark:text-slate-600">
                            Haven't verified your Account?
                        </span>
                        <button
                            type="button"
                            onClick={handleResendLink}
                            className="ml-1 text-emerald-600 hover:text-emerald-700 font-semibold no-underline"
                        >
                            Click Here!
                        </button>
                    </div>
                    <p className="auth-footer">
                        Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link>
                    </p>
                </form>
                <ToastContainer />
            </div>
        </div>
    );
}

export default Login;