import React from 'react';
import '../styles/Home.css';
import { Link } from "react-router-dom";
const Profile = ({ isOpen, onClose, onLogout, username }) => {
    return (
        <>

            {isOpen && <div className="dh-sidebar-overlay" onClick={onClose}></div>}

            <div className={`dh-profile-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="dh-sidebar-header">
                    <h2>User Profile</h2>
                    <button className="dh-close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="dh-sidebar-content">
                    <div className="dh-large-avatar">
                        {username?.charAt(0).toUpperCase()}
                    </div>

                    <div className="dh-user-info-section">
                        <label>Display Name</label>
                        <p>{username || 'Guest'}</p>

                        <label>Account Status</label>
                        <p className="dh-status-badge">Verified Member</p>
                    </div>

                    <div className="dh-sidebar-menu">
                        <Link
                            to="/tracked"
                            className="dh-menu-item no-underline block w-full text-left"
                        >
                            My Tracked Products
                        </Link>
                        <button className="dh-menu-item">Price Alerts</button>
                    </div>
                </div>

                <div className="dh-sidebar-footer">
                    <button className="dh-logout-btn" onClick={onLogout}>
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
};

export default Profile;