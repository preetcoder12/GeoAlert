import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, MapPin, User, FileText, AlertTriangle, ShieldAlert, Clock, Send, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

const ReportForm = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        location: {
            latitude: '',
            longitude: '',
            address: '',
            region: ''
        },
        reportedBy: {
            userId: '',
            name: '',
            contact: ''
        },
        status: 'pending'
    });

    const [errors, setErrors] = useState({
        title: '',
        description: '',
        category: '',
        location: {
            latitude: '',
            longitude: '',
            address: '',
            region: ''
        },
        reportedBy: {
            name: '',
            contact: ''
        }
    });

    const [touchedFields, setTouchedFields] = useState({});
    const [formError, setFormError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const [categories, setCategories] = useState([
        "Drought", "Dust and Haze", "Earthquakes", "Floods",
        "Landslides", "Manmade", "Sea and Lake Ice", "Severe Storms",
        "Snow", "Temperature Extremes", "Volcanoes", "Water Color", "Wildfires"
    ]);

    const userid = localStorage.getItem("authToken") || '';
    const handleBack = () => {
        navigate("/");
    }

    useEffect(() => {
        if (userid) {
            setFormData(prev => ({
                ...prev,
                reportedBy: {
                    ...prev.reportedBy,
                    userId: userid
                }
            }));
        }
    }, [userid]);

    // Generic validation function
    const validateField = (name, value) => {
        let errorMessage = '';

        switch (name) {
            case 'title':
                if (!value.trim()) {
                    errorMessage = 'Incident title is required';
                } else if (value.trim().length < 5) {
                    errorMessage = 'Title must be at least 5 characters';
                } else if (value.trim().length > 100) {
                    errorMessage = 'Title must be less than 100 characters';
                }
                break;

            case 'description':
                if (!value.trim()) {
                    errorMessage = 'Description is required';
                } else if (value.trim().length < 20) {
                    errorMessage = 'Please provide a more detailed description (at least 20 characters)';
                }
                break;

            case 'category':
                if (!value) {
                    errorMessage = 'Please select a category';
                }
                break;

            case 'latitude':
                if (value === '') {
                    errorMessage = 'Latitude is required';
                } else {
                    const lat = parseFloat(value);
                    if (isNaN(lat) || lat < -90 || lat > 90) {
                        errorMessage = 'Latitude must be between -90 and 90';
                    }
                }
                break;

            case 'longitude':
                if (value === '') {
                    errorMessage = 'Longitude is required';
                } else {
                    const lng = parseFloat(value);
                    if (isNaN(lng) || lng < -180 || lng > 180) {
                        errorMessage = 'Longitude must be between -180 and 180';
                    }
                }
                break;

            case 'name':
                if (!value.trim()) {
                    errorMessage = 'Your name is required';
                } else if (value.trim().length < 2) {
                    errorMessage = 'Please enter your full name';
                } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
                    errorMessage = 'Name contains invalid characters';
                }
                break;

            case 'contact':
                if (!value.trim()) {
                    errorMessage = 'Contact information is required';
                } else if (!/^[0-9]+$/.test(value)) {
                    errorMessage = 'Please enter a valid phone number (digits only)';
                } else if (value.length < 10) {
                    errorMessage = 'Phone number must be at least 10 digits';
                }
                break;

            default:
                break;
        }

        return errorMessage;
    };

    // Update touched state when field is blurred
    const handleBlur = (e) => {
        const { name } = e.target;
        setTouchedFields(prev => ({ ...prev, [name]: true }));
    };

    // Handle basic field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));

        // Validate and update errors
        const errorMessage = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: errorMessage
        }));
    };

    // Handle nested fields in reportedBy
    const handleNestedChange = (section, field, value) => {
        setFormData(prevState => ({
            ...prevState,
            [section]: {
                ...prevState[section],
                [field]: value
            }
        }));

        // Validate and update errors for nested fields
        const errorMessage = validateField(field, value);
        setErrors(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: errorMessage
            }
        }));

        // Update touched state
        setTouchedFields(prev => ({ ...prev, [`${section}.${field}`]: true }));
    };

    // Handle location fields
    const handleLocationChange = (field, value) => {
        setFormData(prevState => ({
            ...prevState,
            location: {
                ...prevState.location,
                [field]: value
            }
        }));

        // Validate and update errors for location fields
        const errorMessage = validateField(field, value);
        setErrors(prev => ({
            ...prev,
            location: {
                ...prev.location,
                [field]: errorMessage
            }
        }));

        // Update touched state
        setTouchedFields(prev => ({ ...prev, [`location.${field}`]: true }));
    };

    // Check if the form is valid before submission
    const isFormValid = () => {
        // Create a fresh validation of all fields
        const newErrors = {
            title: validateField('title', formData.title),
            description: validateField('description', formData.description),
            category: validateField('category', formData.category),
            location: {
                latitude: validateField('latitude', formData.location.latitude),
                longitude: validateField('longitude', formData.location.longitude),
                address: '',
                region: ''
            },
            reportedBy: {
                name: validateField('name', formData.reportedBy.name),
                contact: validateField('contact', formData.reportedBy.contact)
            }
        };

        // Update the errors state
        setErrors(newErrors);

        // Mark all fields as touched
        const allFields = {
            'title': true,
            'description': true,
            'category': true,
            'location.latitude': true,
            'location.longitude': true,
            'reportedBy.name': true,
            'reportedBy.contact': true
        };
        setTouchedFields(allFields);

        // Check if any errors exist
        return (
            !newErrors.title &&
            !newErrors.description &&
            !newErrors.category &&
            !newErrors.location.latitude &&
            !newErrors.location.longitude &&
            !newErrors.reportedBy.name &&
            !newErrors.reportedBy.contact
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setSuccess('');

        // Validate form before submission
        if (!isFormValid()) {
            setFormError('Please correct the errors in the form before submitting');
            // Scroll to the top to show the error message
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);

        const payload = {
            ...formData,
            location: {
                ...formData.location,
                latitude: parseFloat(formData.location.latitude) || 0,
                longitude: parseFloat(formData.location.longitude) || 0
            }
        };

        try {
            const response = await fetch('http://localhost:8000/user/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            toast.success("Reported Successsfuly");
            const data = await response.json();

            if (response.ok) {
                setSuccess(data.message || 'Incident reported successfully');
                setFormData({
                    title: '',
                    description: '',
                    category: '',
                    location: {
                        latitude: '',
                        longitude: '',
                        address: '',
                        region: ''
                    },
                    reportedBy: {
                        userId: formData.reportedBy.userId,
                        name: '',
                        contact: ''
                    },
                    status: 'pending'
                });

                // Navigate to home page after successful submission
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                setFormError(data.message || 'Failed to submit report');
            }
        } catch (error) {
            setFormError('Network error: Could not connect to server');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    handleLocationChange('latitude', position.coords.latitude.toString());
                    handleLocationChange('longitude', position.coords.longitude.toString());
                },
                (error) => {
                    setFormError(`Geolocation error: ${error.message}`);
                }
            );
        } else {
            setFormError('Geolocation is not supported by this browser');
        }
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case "Wildfires": return "🔥";
            case "Floods": return "🌊";
            case "Earthquakes": return "🏚️";
            case "Severe Storms": return "🌪️";
            case "Drought": return "☀️";
            case "Volcanoes": return "🌋";
            case "Landslides": return "⛰️";
            case "Snow": return "❄️";
            case "Manmade": return "👨🏻";
            case "Dust and Haze": return "💨";

            default: return "⚠️";
        }
    };

    // Helper function to determine if we should show an error
    const shouldShowError = (fieldPath) => {
        return touchedFields[fieldPath] && getNestedValue(errors, fieldPath);
    };

    // Helper to get a nested value using a dot-notation path
    const getNestedValue = (obj, path) => {
        const keys = path.split('.');
        return keys.reduce((acc, key) => (acc && acc[key] !== undefined) ? acc[key] : '', obj);
    };

    return (
        <div className="max-w-3xl mx-auto p-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-xl border border-slate-200">
            <div className="mb-8 text-center">
                <div className="flex justify-center mb-4">
                    <ShieldAlert className="text-red-600" size={36} />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Emergency Incident Report</h2>
                <p className="text-slate-600">Your report helps us respond quickly and effectively to disasters</p>

                <div className="mt-4 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md text-left">
                    <div className="flex items-start">
                        <AlertTriangle className="text-amber-500 mr-3 mt-1 flex-shrink-0" size={20} />
                        <p className="text-amber-800 text-sm">
                            <span className="font-semibold">Important:</span> Please provide accurate information. Emergency services may be dispatched based on your report.
                        </p>
                    </div>
                </div>
            </div>

            {formError && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-md flex items-start animate-pulse">
                    <AlertCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                    <span className="text-red-800">{formError}</span>
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-md flex items-start">
                    <CheckCircle className="text-green-500 mr-3 flex-shrink-0" size={20} />
                    <div>
                        <h4 className="font-semibold text-green-800">Report Submitted Successfully</h4>
                        <p className="text-green-700 text-sm">{success}</p>
                        <p className="text-green-700 text-sm mt-1">Redirecting to homepage...</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                    <div className="flex items-center mb-4">
                        <AlertTriangle className="mr-3 text-red-500" size={22} />
                        <h3 className="text-xl font-semibold text-slate-800">Incident Details</h3>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Incident Title*
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full p-3 border ${shouldShowError('title') ? 'border-red-500 bg-red-50' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-slate-800`}
                                placeholder="Brief title describing the emergency"
                                required
                            />
                            {shouldShowError('title') && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <AlertCircle size={14} className="mr-1" />
                                    {errors.title}
                                </p>
                            )}
                            <p className="mt-1 text-xs text-slate-500 flex items-center">
                                <Info size={12} className="mr-1" />
                                Use a clear, descriptive title (5-100 characters)
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Category*</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full p-3 border ${shouldShowError('category') ? 'border-red-500 bg-red-50' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-slate-800`}
                                required
                            >
                                <option value="">Select disaster type</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {getCategoryIcon(category)} {category}
                                    </option>
                                ))}
                            </select>
                            {shouldShowError('category') && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <AlertCircle size={14} className="mr-1" />
                                    {errors.category}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description*</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full p-3 border ${shouldShowError('description') ? 'border-red-500 bg-red-50' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent h-32 text-slate-800`}
                                placeholder="Describe the situation, severity, and any immediate dangers..."
                                required
                            />
                            {shouldShowError('description') && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <AlertCircle size={14} className="mr-1" />
                                    {errors.description}
                                </p>
                            )}
                            <p className="mt-1 text-xs text-slate-500 flex items-center">
                                <Info size={12} className="mr-1" />
                                Include details about severity, scale, and potential risks (min 20 characters)
                            </p>
                        </div>
                    </div>
                </div>

                {/* Location Information */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                    <div className="flex items-center mb-4">
                        <MapPin className="mr-3 text-red-500" size={22} />
                        <h3 className="text-xl font-semibold text-slate-800">Location Information</h3>
                    </div>

                    <div className="space-y-5">
                        <div className="flex items-center mb-2">
                            <button
                                type="button"
                                onClick={getCurrentLocation}
                                className="p-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg flex items-center text-sm font-medium transition-colors"
                            >
                                <MapPin className="mr-2" size={18} />
                                Capture My Current Location
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Latitude*</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.location.latitude}
                                    onChange={(e) => handleLocationChange('latitude', e.target.value)}
                                    onBlur={(e) => setTouchedFields(prev => ({ ...prev, 'location.latitude': true }))}
                                    className={`w-full p-3 border ${shouldShowError('location.latitude') ? 'border-red-500 bg-red-50' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-slate-800`}
                                    placeholder="e.g., 40.7128"
                                    required
                                />
                                {shouldShowError('location.latitude') && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <AlertCircle size={14} className="mr-1" />
                                        {errors.location.latitude}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Longitude*</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.location.longitude}
                                    onChange={(e) => handleLocationChange('longitude', e.target.value)}
                                    onBlur={(e) => setTouchedFields(prev => ({ ...prev, 'location.longitude': true }))}
                                    className={`w-full p-3 border ${shouldShowError('location.longitude') ? 'border-red-500 bg-red-50' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-slate-800`}
                                    placeholder="e.g., -74.0060"
                                    required
                                />
                                {shouldShowError('location.longitude') && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center">
                                        <AlertCircle size={14} className="mr-1" />
                                        {errors.location.longitude}
                                    </p>
                                )}
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center mt-1">
                            <Info size={12} className="mr-1" />
                            Latitude must be between -90 and 90, Longitude between -180 and 180
                        </p>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                            <input
                                type="text"
                                value={formData.location.address}
                                onChange={(e) => handleNestedChange('location', 'address', e.target.value)}
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-slate-800"
                                placeholder="Street address or landmark near the incident"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Region/Area</label>
                            <input
                                type="text"
                                value={formData.location.region}
                                onChange={(e) => handleNestedChange('location', 'region', e.target.value)}
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-slate-800"
                                placeholder="Neighborhood, district, or area affected"
                            />
                        </div>
                    </div>
                </div>

                {/* Reporter Information */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                    <div className="flex items-center mb-4">
                        <User className="mr-3 text-red-500" size={22} />
                        <h3 className="text-xl font-semibold text-slate-800">Reporter Information</h3>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Your Name*</label>
                            <input
                                type="text"
                                value={formData.reportedBy.name}
                                onChange={(e) => handleNestedChange('reportedBy', 'name', e.target.value)}
                                onBlur={(e) => setTouchedFields(prev => ({ ...prev, 'reportedBy.name': true }))}
                                className={`w-full p-3 border ${shouldShowError('reportedBy.name') ? 'border-red-500 bg-red-50' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-slate-800`}
                                placeholder="Your full name"
                                required
                            />
                            {shouldShowError('reportedBy.name') && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <AlertCircle size={14} className="mr-1" />
                                    {errors.reportedBy.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number*</label>
                            <input
                                type="number"
                                value={formData.reportedBy.contact}
                                onChange={(e) => handleNestedChange('reportedBy', 'contact', e.target.value)}
                                onBlur={(e) => setTouchedFields(prev => ({ ...prev, 'reportedBy.contact': true }))}
                                className={`w-full p-3 border ${shouldShowError('reportedBy.contact') ? 'border-red-500 bg-red-50' : 'border-slate-300'} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-slate-800`}
                                placeholder="Phone number for emergency contact"
                                required
                            />
                            {shouldShowError('reportedBy.contact') && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                    <AlertCircle size={14} className="mr-1" />
                                    {errors.reportedBy.contact}
                                </p>
                            )}
                            <p className="mt-1 text-xs text-slate-500 flex items-center">
                                <Info size={12} className="mr-1" />
                                Enter digits only (minimum 10 digits)
                            </p>
                        </div>
                    </div>
                </div>
                <div className="pt-4 flex justify-between gap-4">
                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 px-6 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-md transition duration-300 
            flex justify-center items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <>
                                <Clock className="animate-spin" size={20} />
                                Submitting Report...
                            </>
                        ) : (
                            <>
                                <Send size={20} />
                                Submit Emergency Report
                            </>
                        )}
                    </button>

                    {/* Back Button */}
                    <button
                        type="button"
                        onClick={handleBack} // Replace with your function
                        className="py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg shadow-sm transition duration-300 
            flex justify-center items-center gap-2 active:scale-95"
                    >
                        ⬅ Back
                    </button>
                </div>

            </form>

            <div className="mt-8 text-center text-sm text-slate-500">
                <p>All reports are monitored 24/7 by emergency response teams</p>
                <p className="mt-1">In case of immediate danger, please also call your local emergency number</p>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />

        </div>
    );
};

export default ReportForm;