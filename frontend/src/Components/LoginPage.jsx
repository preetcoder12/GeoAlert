import { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { IoIosEye } from "react-icons/io";
import { IoIosEyeOff } from "react-icons/io";

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showpass, setshowpass] = useState(false)

    const togglepass = () => {
        setshowpass(!showpass);

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

            toast.success("Login successful! Redirecting...");
            setMessage(response.data.message);
            setFormData({ email: '', password: '' });

            setTimeout(() => {
                window.location.href = "/";  
            }, 1500);

        } catch (error) {
            setMessage(error.response?.data?.error || 'Login failed');
            toast.error(error.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-50">
            <div className="flex w-full max-w-4xl overflow-hidden rounded-xl shadow-2xl">
                {/* Left Side - Image and Information */}
                <div className="hidden md:block w-1/2 bg-blue-600 p-8 text-white">
                    <div className="h-full flex flex-col justify-between">
                        <div>
                            <h2 className="text-3xl font-bold mb-4">Disaster Alert & Response System</h2>
                            <p className="text-blue-100 mb-6">Welcome back! Sign in to access real-time alerts about emergencies in your area.</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="bg-blue-500 p-2 rounded-full mr-3">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-sm">Real-time disaster notifications</p>
                            </div>
                            <div className="flex items-start">
                                <div className="bg-blue-500 p-2 rounded-full mr-3">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-sm">Interactive map-based tracking</p>
                            </div>
                            <div className="flex items-start">
                                <div className="bg-blue-500 p-2 rounded-full mr-3">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <p className="text-sm">Community emergency reporting</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full md:w-1/2 bg-white p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
                        <p className="text-gray-600 text-sm">Login to access your alerts and community resources</p>
                    </div>

                    {message && (
                        <div className={`p-3 mb-4 rounded ${message.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="john@example.com"
                            />
                        </div>

                        <div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showpass ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={togglepass}
                                        className="absolute inset-y-0 right-2 flex items-center text-gray-600"
                                    >
                                        {showpass ? <IoIosEyeOff size={20} /> : <IoIosEye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <a href="/forgot-password" className="text-xs text-blue-600 hover:underline mt-1">
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-70"
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
                            Don't have an account yet?{" "}
                            <a href="/signup" className="text-blue-600 hover:underline">
                                Create account
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