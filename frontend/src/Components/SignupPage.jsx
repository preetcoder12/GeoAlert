import { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { IoIosEye, IoIosEyeOff } from "react-icons/io";
import { FaBell, FaUserShield } from "react-icons/fa";
import 'react-toastify/dist/ReactToastify.css';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'user',
        subscribedToAlerts: true,
        location: {
            latitude: null,
            longitude: null
        }
    });

    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showpass, setshowpass] = useState(false);
    const togglepass = () => setshowpass(!showpass);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setFormData((prev) => ({
                        ...prev,
                        location: {
                            latitude,
                            longitude
                        }
                    }));
                    toast.success(`Location set: (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
                },
                (error) => {
                    toast.error("Failed to get location");
                }
            );
        } else {
            toast.error("Geolocation not supported");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/user/signup', formData);
            toast.success("Signup successful! Redirecting...");
            setMessage(response.data.message);

            setFormData({
                name: '',
                email: '',
                phone: '',
                password: '',
                role: 'user',
                subscribedToAlerts: true,
                location: {
                    latitude: null,
                    longitude: null
                }
            });

            setTimeout(() => {
                window.location.href = "/login";
            }, 1500);
        } catch (error) {
            setMessage(error.response?.data?.error || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-red-100 px-4 py-10">
            <div className="w-full max-w-5xl bg-white shadow-2xl rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
                <div className="hidden md:flex flex-col justify-center bg-gradient-to-b from-red-600 to-red-500 text-white p-8">
                    <div className="flex flex-col gap-6">
                        <h2 className="text-4xl font-extrabold leading-tight">Disaster Alert System</h2>
                        <p className="text-lg text-red-100">
                            Get real-time alerts for earthquakes, floods, storms, and more.
                        </p>
                        <div className="flex items-center gap-2 mt-6 text-yellow-100">
                            <FaBell size={20} />
                            <span>Stay informed. Stay safe.</span>
                        </div>
                    </div>
                </div>

                <div className="w-full p-10">
                    <div className="mb-6">
                        <h2 className="text-3xl font-bold text-gray-800">Sign Up</h2>
                        <p className="text-gray-500 text-sm">Create your account to start receiving alerts.</p>
                    </div>

                    {message && (
                        <div className={`p-3 mb-4 rounded text-sm transition-all ${message.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-400"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-400"
                                placeholder="john@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (with country code)</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                pattern="^\+[1-9]\d{1,14}$"
                                required
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-400"
                                placeholder="+919876543210"
                            />
                            <p className="text-xs text-gray-500 mt-1">Format: +[country code][number], e.g., +91XXXXXXXXXX</p>
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showpass ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-400"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={togglepass}
                                    className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                                >
                                    {showpass ? <IoIosEyeOff size={18} /> : <IoIosEye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-400"
                            >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="subscribedToAlerts"
                                checked={formData.subscribedToAlerts}
                                onChange={handleChange}
                                className="accent-red-500"
                            />
                            <label className="text-sm text-gray-700">Subscribe to real-time disaster alerts</label>
                        </div>

                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={handleSetLocation}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors duration-300"
                            >
                                Set Current Location
                            </button>

                            {formData.location.latitude && formData.location.longitude && (
                                <p className="text-sm text-gray-700 text-center">
                                    📍 Location Set: ({formData.location.latitude.toFixed(4)}, {formData.location.longitude.toFixed(4)})
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors duration-300"
                        >
                            {loading ? "Processing..." : "Create Account"}
                        </button>

                        <div className="text-center text-sm text-gray-500">
                            Already registered?{" "}
                            <a href="/login" className="text-red-500 hover:underline">
                                Login here
                            </a>
                        </div>
                    </form>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default SignupPage;
