import React, { useEffect, useState, useRef } from 'react'; // Added useRef
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faSpinner, faPaperPlane, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { handleError, handleSuccess } from '../utils';
import { ToastContainer } from 'react-toastify';

function EmailVerification() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying');
    const [isResending, setIsResending] = useState(false);
    const hasCalledRef = useRef(false); // Ref to track if verification was already attempted

    const email = searchParams.get('email');
    const token = searchParams.get('token');

    useEffect(() => {
        const verify = async () => {
            // Prevent duplicate calls in React Strict Mode
            if (hasCalledRef.current) return;
            hasCalledRef.current = true;

            try {
                // Ensure full URL to backend port 8000
                const response = await fetch(`http://localhost:8000/verify?token=${token}&email=${email}`);
                const result = await response.json();

                // Small timeout to let user see the "Verifying" state
                setTimeout(() => {
                    if (result.success) {
                        setStatus('success');
                    } else {
                        setStatus('error');
                    }
                }, 1000);
            } catch (err) {
                setStatus('error');
            }
        };

        if (token && email) {
            verify();
        } else {
            setStatus('error');
        }
    }, [token, email]);

    const handleResend = async () => {
        setIsResending(true);
        try {
            // Updated to full backend URL for consistency
            const response = await fetch('http://localhost:8000/resend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const result = await response.json();

            if (response.ok) {
                handleSuccess("Verification link sent to your email!");
            } else {
                handleError(result.message || "Failed to resend link");
            }
        } catch (err) {
            handleError("An error occurred. Please try again.");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-[#0f172a] font-['Plus_Jakarta_Sans'] text-center">
            <div className="bg-white/85 backdrop-blur-xl border border-white/30 rounded-[28px] w-full max-w-[500px] p-10 md:p-14 shadow-2xl">

                {/* 1. VERIFYING STATE */}
                {status === 'verifying' && (
                    <>
                        <FontAwesomeIcon icon={faSpinner} className="text-emerald-500 text-6xl mb-6 animate-spin" />
                        <h1 className="text-2xl font-bold mb-2 text-slate-800">Verifying your email...</h1>
                    </>
                )}

                {/* 2. SUCCESS STATE: Tick mark, no Resend button */}
                {status === 'success' && (
                    <div className="flex flex-col items-center justify-center w-full"> {/* Added items-center and w-full */}
                        {/* Success Icon */}
                        <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500 text-6xl mb-6" />

                        {/* Success Message */}
                        <h1 className="text-2xl font-bold mb-2 text-slate-800">Verification Success!</h1>
                        <p className="text-slate-600 mb-8 font-medium max-w-xs mx-auto">
                            Your account is now active. You can start tracking prices.
                        </p>

                        {/* Centered Back to Login Link */}
                        <div className="flex justify-center w-full"> {/* Wrapper to force center alignment */}
                            <Link
                                to="/login"
                                className="group flex items-center gap-2 text-slate-800 font-bold hover:text-emerald-600 transition-all duration-300 no-underline"
                            >
                                <FontAwesomeIcon
                                    icon={faArrowLeft}
                                    className="text-sm transform group-hover:-translate-x-1 transition-transform"
                                />
                                Back to Login
                            </Link>
                        </div>
                    </div>
                )}

                {/* 3. ERROR STATE: Cross mark with Resend button */}
                {status === 'error' && (
                    <div className="flex flex-col items-center justify-center w-full">
                        <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 text-6xl mb-6" />
                        <h1 className="text-2xl font-bold mb-2 text-slate-800">Verification Failed</h1>
                        <p className="text-slate-600 mb-8 font-medium">
                            The link is invalid or has expired. This can happen if you've already verified or requested a newer link.
                        </p>

                        <div className="flex flex-col items-center gap-4 w-full"> {/* Changed to items-center */}
                            <button
                                onClick={handleResend}
                                disabled={isResending}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 py-4 font-bold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50 w-full max-w-sm"
                            >
                                <FontAwesomeIcon
                                    icon={isResending ? faSpinner : faPaperPlane}
                                    className={isResending ? "animate-spin" : ""}
                                />
                                {isResending ? "Sending..." : "Resend Verification Link"}
                            </button>

                            {/* Centered Link Wrapper */}
                            <div className="flex justify-center w-full mt-2">
                                <Link
                                    to="/login"
                                    className="group flex items-center gap-2 text-slate-800 font-bold hover:text-emerald-600 transition-all duration-300 no-underline"
                                >
                                    <FontAwesomeIcon
                                        icon={faArrowLeft}
                                        className="text-sm transform group-hover:-translate-x-1 transition-transform"
                                    />
                                    Back to Login
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <ToastContainer />
        </div>
    );
}

export default EmailVerification;