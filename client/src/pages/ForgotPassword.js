import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

function ForgotPassword() {
    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return handleError('Email is required');
        try {
            const response = await fetch('/forgot', {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const result = await response.json();
            handleSuccess(result.message);
        } catch (err) {
            handleError("Failed to send request");
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-[#0f172a] bg-[radial-gradient(at_0%_0%,rgba(16,185,129,0.12)_0px,transparent_50%),radial-gradient(at_100%_100%,rgba(99,102,241,0.1)_0px,transparent_50%)] font-['Plus_Jakarta_Sans']">
            <div className="bg-white/85 backdrop-blur-xl border border-white/30 rounded-[28px] w-full max-w-[500px] p-10 md:p-14 shadow-2xl">
                <div className="text-center mb-10">
                    <h1 className="text-[#1e293b] text-3xl md:text-[34px] font-extrabold mb-3 tracking-tight">Reset <span className="text-[#059669]">Password</span></h1>
                    <p className="text-[#475569] text-base font-medium">Enter your email and we'll send you a link to get back into your account.</p>
                </div>
                <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-2">
                        <label className="text-[#1e293b] text-sm font-bold">Email Address</label>
                        <div className="relative flex items-center">
                            <FontAwesomeIcon icon={faEnvelope} className="absolute left-[18px] text-[#64748b] z-10" />
                            <input
                                onChange={(e) => setEmail(e.target.value)}
                                type='email'
                                placeholder='name@company.com'
                                className="w-full bg-slate-100/60 border-2 border-slate-200/80 rounded-xl py-4 pl-[45px] pr-4 text-[#0f172a] focus:border-emerald-500 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <button className="mt-2 bg-[#1e293b] hover:bg-[#0f172a] text-white rounded-xl py-[18px] text-base font-bold transition-all hover:-translate-y-0.5" type="submit">
                        Send Reset Link
                    </button>
                    <p className="mt-8 text-center text-sm text-[#475569]">
                        <Link to="/login" className="text-[#059669] font-bold no-underline">
                            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back to Login
                        </Link>
                    </p>
                </form>
                <ToastContainer />
            </div>
        </div>
    );
}

export default ForgotPassword;