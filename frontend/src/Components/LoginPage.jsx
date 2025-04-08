import { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { IoIosEye, IoIosEyeOff } from "react-icons/io";
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [loading, setLoading] = useState(false);
    const [showpass, setShowpass] = useState(false);

    const togglepass = () => {
        setShowpass(!showpass);
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/user/login', formData);
            const { token } = response.data;

            localStorage.setItem("authToken", token);
            setMessage(response.data.message);
            setMessageType('success');
            toast.success("Login successful! Redirecting...");
            setFormData({ email: '', password: '' });

            setTimeout(() => {
                window.location.href = "/";
            }, 1500);

        } catch (error) {
            const errorMsg = error.response?.data?.error || 'Login failed';
            setMessage(errorMsg);
            setMessageType('error');
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-100 to-yellow-50 font-sans">
            <div className="flex w-full max-w-5xl overflow-hidden rounded-3xl shadow-2xl border border-red-300">
                
                {/* Left Side - Visual Info */}
                <div className="hidden md:block w-1/2 bg-gradient-to-tr from-red-700 to-red-500 text-white p-8">
                    <div className="h-full flex flex-col justify-between">
                        <div>
                            <h2 className="text-4xl font-extrabold mb-4 tracking-wide">Disaster Alert System</h2>
                            <p className="text-red-100 text-base mb-6">Stay informed and safe. Log in to get real-time disaster alerts in your area.</p>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <span className="bg-red-600 p-2 rounded-full mr-3">
                                    <svg className="w-5 h-5" fill="white" viewBox="0 0 20 20">
                                        <path d="M10 2a1 1 0 011 1v1a7 7 0 016.93 6H18a1 1 0 110-2h1a9 9 0 10-8 8.94V17a1 1 0 11-2 0v-1a7 7 0 01-7-7H2a9 9 0 018-8.94V3a1 1 0 011-1z" />
                                    </svg>
                                </span>
                                <p>Real-time disaster notifications</p>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-red-600 p-2 rounded-full mr-3">
                                    <svg className="w-5 h-5" fill="white" viewBox="0 0 20 20">
                                        <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h3v-2H4V5h12v10h-3v2h3a2 2 0 002-2V5a2 2 0 00-2-2H4z" />
                                    </svg>
                                </span>
                                <p>Location-based alert tracking</p>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-red-600 p-2 rounded-full mr-3">
                                    <svg className="w-5 h-5" fill="white" viewBox="0 0 20 20">
                                        <path d="M6 2a1 1 0 00-1 1v14a1 1 0 102 0v-6h6v6a1 1 0 102 0V3a1 1 0 00-1-1H6z" />
                                    </svg>
                                </span>
                                <p>Community-sourced reporting</p>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full md:w-1/2 bg-white p-10">
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
                        <p className="text-gray-600 text-sm">Login to receive urgent alerts and contribute to community safety.</p>
                    </div>

                    {message && (
                        <div className={`p-3 mb-4 rounded-md shadow-sm font-medium text-sm ${messageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                placeholder="john@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showpass ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={togglepass}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                                >
                                    {showpass ? <IoIosEyeOff size={20} /> : <IoIosEye size={20} />}
                                </button>
                            </div>

                            <div className="flex justify-end mt-1">
                                <a href="/forgot-password" className="text-xs text-red-600 hover:underline">
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 text-white py-2 px-4 rounded-md font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-70"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </span>
                            ) : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{" "}
                            <a href="/signup" className="text-red-600 hover:underline font-semibold">
                                Create one now
                            </a>
                        </p>
                    </div>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default LoginPage;
