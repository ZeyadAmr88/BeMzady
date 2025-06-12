import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Mail } from 'lucide-react';

const EmailVerification = () => {
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const inputRefs = useRef([]);

    // Check verification status on component mount
    useEffect(() => {
        const checkVerificationStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get('https://be-mazady.vercel.app/api/users/MyProfile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.data.success && response.data.data.verified) {
                    navigate('/');
                }
            } catch (error) {
                console.error('Error checking verification status:', error);
            }
        };

        checkVerificationStatus();
    }, [navigate]);

    // Initialize refs for each input
    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, 6);
    }, []);

    const handleInputChange = (index, value) => {
        // Only allow numbers
        if (!/^\d*$/.test(value)) return;

        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);

        // Move to next input if value is entered
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d*$/.test(pastedData)) return;

        const newCode = [...verificationCode];
        for (let i = 0; i < pastedData.length; i++) {
            newCode[i] = pastedData[i];
        }
        setVerificationCode(newCode);
    };

    const handleVerification = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const code = verificationCode.join('');
            const token = localStorage.getItem('token'); // Get token from localStorage
            const response = await axios.post('https://be-mazady.vercel.app/api/Auth/verify-email',
                { code: code },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data.success) {
                toast.success('Email verified successfully');
                navigate('/');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('https://be-mazady.vercel.app/api/Auth/resend-verification',
                {}, // empty body
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            if (response.data.success) {
                toast.success('Verification code resent to your email');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend verification code');
        }
    };

    return (
        <div className="max-w-md mx-auto my-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-full">
                        <Mail size={24} className="text-rose-600 dark:text-rose-400" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verify Your Email</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Please enter the 6-digit code sent to your email
                </p>
            </div>

            <form onSubmit={handleVerification} className="space-y-6">
                <div className="flex justify-center gap-2 mb-8">
                    {verificationCode.map((digit, index) => (
                        <input
                            key={index}
                            ref={el => inputRefs.current[index] = el}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            className="w-12 h-12 text-center text-xl font-semibold bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-rose-500 focus:border-rose-500"
                        />
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={isLoading || verificationCode.some(digit => !digit)}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                            </svg>
                            Verifying...
                        </span>
                    ) : (
                        "Verify Email"
                    )}
                </button>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={handleResendCode}
                        className="text-sm text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300"
                    >
                        Didn't receive the code? Resend
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EmailVerification; 