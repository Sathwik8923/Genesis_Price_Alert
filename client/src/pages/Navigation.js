import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { handleSuccess } from '../utils';
import Profile from '../pages/Profile';
import '../styles/Home.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

const Navigation = () => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('loggedInUser');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        handleSuccess('User Logged out');
        setIsProfileOpen(false);
        setTimeout(() => {
            navigate('/login');
        }, 1000);
    };
    return (
        <>
            <nav className="dh-navbar">
                <Link to="/" className="dh-logo">Deal<span>Hunt</span></Link>
                
                <div className="dh-nav-links">
                    {/* 2. Added Tracked Products with FontAwesome Icon */}
                    <Link to="/tracked" className="dh-nav-item dh-wishlist-link">
                        <FontAwesomeIcon icon={faHeart} className="dh-wishlist-icon" size='lg' />
                    </Link>
                    {token ? (
                        <div className="dh-profile-trigger" onClick={() => setIsProfileOpen(true)}>
                            <div className="dh-avatar">{user?.charAt(0).toUpperCase()}</div>
                            <span className="dh-user-name">{user}</span>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className="dh-auth-btn dh-btn-login">Login</Link>
                            <Link to="/signup" className="dh-auth-btn dh-btn-signup">Sign Up</Link>
                        </>
                    )}
                </div>
            </nav>

            <Profile 
                isOpen={isProfileOpen} 
                onClose={() => setIsProfileOpen(false)} 
                onLogout={handleLogout}
                username={user}
            />
        </>
    );
}

export default Navigation;