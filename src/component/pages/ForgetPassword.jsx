"use client"

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { Mail } from 'lucide-react';

const ForgetPassword = () => {
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: email, 2: verification, 3: new password
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleSendCode = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            console.log('Sending request with email:', email); // Debug log
            const response = await axios.post('https://be-mazady.vercel.app/api/Auth/forgotpassword', {
                email: email
            });

            console.log('Response:', response.data); // Debug log

            if (response.data.success) {
                toast.success('Verification code sent to your email');
                setStep(2);
            } else {
                toast.error(response.data.message || 'Failed to send verification code');
            }
        } catch (error) {
            console.error('Error details:', error.response?.data); // Debug log
            if (error.response?.data?.message === "No user with given email") {
                toast.error('No account found with this email address. Please check your email or sign up.');
            } else {
                toast.error(error.response?.data?.message || 'Failed to send verification code');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const resetCode = verificationCode.join('');
            const response = await axios.post('https://be-mazady.vercel.app/api/Auth/verify', {
                resetCode: resetCode
            });

            if (response.data.success) {
                toast.success('Code verified successfully');
                setStep(3);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.put('https://be-mazady.vercel.app/api/Auth/resetpassword', {
                email: email,
                newPassword: newPassword
            });

            if (response.data.success) {
                toast.success('Password reset successfully');
                navigate('/login');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);

        if (value && index < 5) {
            const nextInput = document.querySelector(`input[name="code-${index + 1}"]`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
            const prevInput = document.querySelector(`input[name="code-${index - 1}"]`);
            if (prevInput) prevInput.focus();
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {step === 1 ? 'Forgot Password' : step === 2 ? 'Reset Code' : 'Reset Password'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    {step === 1 ? 'Enter your email to receive a verification code' :
                        step === 2 ? 'Enter the 6-digit code sent to your email' :
                            'Enter your new password'}
                </p>
            </div>

            {step === 1 && (
                <form onSubmit={handleSendCode} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block mb-2 text-sm font-medium">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Mail size={18} className="text-gray-500 dark:text-gray-400" />
                            </div>
                            <input
                                type="email"
                                id="email"
                                className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block w-full pl-10 p-2.5"
                                placeholder="name@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Sending...' : 'Send Code'}
                    </button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleVerifyCode} className="space-y-6">
                    <div className="flex justify-center gap-2 mb-8">
                        {verificationCode.map((digit, index) => (
                            <input
                                key={index}
                                name={`code-${index}`}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-12 text-center text-xl font-semibold bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:ring-rose-500 focus:border-rose-500"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || verificationCode.some(digit => !digit)}
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Verifying...' : 'Verify Code'}
                    </button>
                </form>
            )}

            {step === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-6">
                    <div>
                        <label htmlFor="newPassword" className="block mb-2 text-sm font-medium">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block w-full p-2.5"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-rose-500 focus:border-rose-500 block w-full p-2.5"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default ForgetPassword;
