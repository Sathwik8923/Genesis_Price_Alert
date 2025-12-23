import React from 'react'
import Searching from '../pages/Searching';
import Navigation from '../pages/Navigation';
import '../styles/Home.css';

function Home() {
    return (
        <div className="dh-main-wrapper">
            <Navigation />
            
            <main>
                <Searching />
            </main>

            <footer className="dh-footer">
                <div className="dh-footer-grid">
                    <div>
                        <h3>DealHunt</h3>
                        <p>Your ultimate destination for price comparison and real-time deal tracking.</p>
                    </div>
                    <div>
                        <h4>Company</h4>
                        <p>About Us</p>
                        <p>Privacy Policy</p>
                    </div>
                    <div>
                        <h4>Support</h4>
                        <p>Help Center</p>
                        <p>Contact Us</p>
                    </div>
                </div>
                <div className="dh-footer-bottom">
                    © 2024 DealHunt Technologies Inc. All rights reserved.
                </div>
            </footer>
        </div>
    )
}
export default Home;