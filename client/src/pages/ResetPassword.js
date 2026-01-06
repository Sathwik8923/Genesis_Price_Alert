import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faEye, faEyeSlash, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

function ResetPassword() {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const email = searchParams.get('email');
    const token = searchParams.get('token');

    const handleReset = async (e) => {
        e.preventDefault();
        
        // Basic frontend validation
        if (password.length < 6) {
            return handleError("Password must be at least 6 characters long");
        }

        try {
            // Ensure this hits your backend port (usually 8000)
            const response = await fetch('http://localhost:8000/reset', {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                handleSuccess(result.message);
                // Redirect to login after success
                setTimeout(() => navigate('/login'), 2000);
            } else {
                // This will display "New password cannot be the same as old password" 
                // if you updated your backend logic as discussed.
                handleError(result.message);
            }
        } catch (err) {
            handleError("Password reset failed. Please try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-6 font-['Plus_Jakarta_Sans']">
            <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-[28px] w-full max-w-[450px] p-8 md:p-12 shadow-2xl">
                
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-[#1e293b] mb-2">New Password</h1>
                    <p className="text-slate-500 font-medium">Please enter a unique password to secure your account.</p>
                </div>

                <form onSubmit={handleReset} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-[#1e293b] text-sm font-bold ml-1">New Password</label>
                        <div className="relative flex items-center">
                            <FontAwesomeIcon 
                                icon={faLock} 
                                className="absolute left-[18px] text-[#64748b] z-10" 
                            />
                            <input
                                onChange={(e) => setPassword(e.target.value)}
                                type={showPassword ? 'text' : 'password'}
                                placeholder='••••••••'
                                className="w-full bg-slate-100/60 border-2 border-slate-200/80 rounded-xl py-4 pl-[45px] pr-[50px] text-[#0f172a] focus:border-emerald-500 outline-none transition-all"
                                required
                            />
                            <span 
                                className="absolute right-[16px] cursor-pointer text-[#64748b] opacity-60 hover:opacity-100 hover:text-emerald-600 z-10" 
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <FontAwesomeIcon icon={showPassword ? faEye : faEyeSlash} />
                            </span>
                        </div>
                    </div>

                    <button 
                        className="bg-[#1e293b] text-white rounded-xl py-4 font-bold transition-all hover:bg-[#0f172a] shadow-lg active:scale-[0.98]" 
                        type="submit"
                    >
                        Update Password
                    </button>
                </form>

                {/* Centered Back to Login Link */}
                <div className="mt-8 flex justify-center w-full">
                    <Link 
                        to="/login" 
                        className="group flex items-center gap-2 text-slate-500 font-bold hover:text-emerald-600 transition-all duration-300 no-underline"
                    >
                        <FontAwesomeIcon 
                            icon={faArrowLeft} 
                            className="text-sm transform group-hover:-translate-x-1 transition-transform" 
                        />
                        Back to Login
                    </Link>
                </div>

                <ToastContainer />
            </div>
        </div>
    );
}

export default ResetPassword;