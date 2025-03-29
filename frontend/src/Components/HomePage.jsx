import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import { Bell, TrendingUp, MapPin, Flame, Waves, Wind, Globe, Shield, AlertTriangle, Activity, Download, ChevronDown, Info } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import * as d3 from 'd3';
import * as THREE from 'three';

const HomePage = () => {
    const [activeDisasters, setActiveDisasters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState({ lat: 20, lng: 0 }); // Default to center of world map
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'Wildfire', location: 'Uttarakhand Hills, India', severity: 'High', time: '10 mins ago' },
        { id: 2, type: 'Flood', location: 'Mumbai Suburbs, India', severity: 'Medium', time: '25 mins ago' },
        { id: 3, type: 'Storm', location: 'Chennai Coast, India', severity: 'High', time: '42 mins ago' },
        { id: 4, type: 'Earthquake', location: 'Tokyo, Japan', severity: 'High', time: '1 hour ago' },
        { id: 5, type: 'Tsunami', location: 'Bali, Indonesia', severity: 'High', time: '2 hours ago' },
        { id: 6, type: 'Wildfire', location: 'California, USA', severity: 'Medium', time: '3 hours ago' },
    ]);
    const [view, setView] = useState('map'); // 'map' or 'globe'
    const [continent, setContinent] = useState('all'); // Filter by continent
    const [disasterType, setDisasterType] = useState('all'); // Filter by disaster type
    const globeRef = useRef(null);

    // Mock global disaster data for demonstration
    useEffect(() => {
        // This would be an API call in production
        setTimeout(() => {
            setActiveDisasters([
                // Asia
                { id: 1, type: 'wildfire', lat: 28.7041, lng: 77.1025, severity: 'high', location: 'Delhi Outskirts, India', continent: 'asia' },
                { id: 2, type: 'flood', lat: 19.0760, lng: 72.8777, severity: 'medium', location: 'Mumbai Suburbs, India', continent: 'asia' },
                { id: 3, type: 'earthquake', lat: 26.8467, lng: 80.9462, severity: 'low', location: 'Lucknow, India', continent: 'asia' },
                { id: 4, type: 'storm', lat: 13.0827, lng: 80.2707, severity: 'high', location: 'Chennai Coast, India', continent: 'asia' },
                { id: 5, type: 'earthquake', lat: 35.6762, lng: 139.6503, severity: 'high', location: 'Tokyo, Japan', continent: 'asia' },
                { id: 6, type: 'tsunami', lat: -8.3405, lng: 115.0920, severity: 'high', location: 'Bali, Indonesia', continent: 'asia' },

                // North America
                { id: 7, type: 'wildfire', lat: 34.0522, lng: -118.2437, severity: 'medium', location: 'Los Angeles, USA', continent: 'north_america' },
                { id: 8, type: 'hurricane', lat: 25.7617, lng: -80.1918, severity: 'high', location: 'Miami, USA', continent: 'north_america' },
                { id: 9, type: 'tornado', lat: 41.8781, lng: -87.6298, severity: 'medium', location: 'Chicago, USA', continent: 'north_america' },

                // Europe
                { id: 10, type: 'flood', lat: 48.8566, lng: 2.3522, severity: 'medium', location: 'Paris, France', continent: 'europe' },
                { id: 11, type: 'storm', lat: 51.5074, lng: -0.1278, severity: 'low', location: 'London, UK', continent: 'europe' },

                // Africa
                { id: 12, type: 'drought', lat: -1.2921, lng: 36.8219, severity: 'high', location: 'Nairobi, Kenya', continent: 'africa' },
                { id: 13, type: 'flood', lat: 30.0444, lng: 31.2357, severity: 'medium', location: 'Cairo, Egypt', continent: 'africa' },

                // South America
                { id: 14, type: 'landslide', lat: -22.9068, lng: -43.1729, severity: 'high', location: 'Rio de Janeiro, Brazil', continent: 'south_america' },

                // Australia/Oceania
                { id: 15, type: 'cyclone', lat: -33.8688, lng: 151.2093, severity: 'high', location: 'Sydney, Australia', continent: 'oceania' },
            ]);
            setLoading(false);
        }, 1500);
    }, []);

    // Get user location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        }
    }, []);

    // Filter disasters based on selected filters
    const filteredDisasters = activeDisasters.filter(disaster => {
        const continentMatch = continent === 'all' || disaster.continent === continent;
        const typeMatch = disasterType === 'all' || disaster.type === disasterType;
        return continentMatch && typeMatch;
    });

    // Get icon based on disaster type
    const getDisasterIcon = (type) => {
        switch (type) {
            case 'wildfire':
                return <Flame className="w-6 h-6 text-red-600" />;
            case 'flood':
                return <Waves className="w-6 h-6 text-blue-600" />;
            case 'storm':
            case 'hurricane':
            case 'cyclone':
                return <Wind className="w-6 h-6 text-gray-600" />;
            case 'earthquake':
                return <Activity className="w-6 h-6 text-yellow-600" />;
            case 'tsunami':
                return <Waves className="w-6 h-6 text-indigo-600" />;
            case 'drought':
                return <AlertTriangle className="w-6 h-6 text-orange-600" />;
            case 'tornado':
                return <Wind className="w-6 h-6 text-purple-600" />;
            case 'landslide':
                return <AlertTriangle className="w-6 h-6 text-amber-600" />;
            default:
                return <MapPin className="w-6 h-6 text-yellow-600" />;
        }
    };

    // Get color for severity
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getSeverityMarkerColor = (severity) => {
        switch (severity) {
            case 'high':
                return { color: 'red', radius: 15 };
            case 'medium':
                return { color: 'orange', radius: 12 };
            case 'low':
                return { color: 'green', radius: 10 };
            default:
                return { color: 'gray', radius: 8 };
        }
    };

    // Initialize 3D Globe (simplified implementation)
    useEffect(() => {
        if (view === 'globe' && globeRef.current) {
            // In a real application, this would be a full THREE.js implementation
            // This is just a placeholder to show where the 3D globe would be initialized
            const container = globeRef.current;
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer();
            renderer.setSize(container.clientWidth, container.clientHeight);
            container.appendChild(renderer.domElement);

            // Create a sphere for the Earth
            const geometry = new THREE.SphereGeometry(5, 32, 32);
            const material = new THREE.MeshBasicMaterial({ color: 0x0077be });
            const sphere = new THREE.Mesh(geometry, material);
            scene.add(sphere);

            camera.position.z = 10;

            // Animation loop
            const animate = function () {
                requestAnimationFrame(animate);
                sphere.rotation.y += 0.005;
                renderer.render(scene, camera);
            };

            animate();

            // Clean up on unmount
            return () => {
                container.removeChild(renderer.domElement);
            };
        }
    }, [view]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-700 to-indigo-800 shadow-lg">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <Globe className="h-8 w-8 text-white mr-2" />
                        <h1 className="text-2xl font-bold text-white">Geo Alert</h1>
                        <div className="ml-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs">LIVE</div>
                    </div>

                    <nav className="hidden md:flex space-x-6">
                        <a href="#" className="text-white hover:text-blue-200 transition">Dashboard</a>
                        <a href="#" className="text-white hover:text-blue-200 transition">Report Incident</a>
                        <a href="#" className="text-white hover:text-blue-200 transition">Global Alerts</a>
                        <a href="#" className="text-white hover:text-blue-200 transition">Resources</a>
                        <a href="#" className="text-white hover:text-blue-200 transition">Analytics</a>
                    </nav>

                    <div className="flex items-center space-x-2">
                        <div className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm flex items-center mr-2">
                            <Globe className="h-4 w-4 mr-1" />
                            <span>Global</span>
                        </div>
                        <button className="bg-white text-indigo-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-50 transition">
                            Report Emergency
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative bg-gray-900 text-white py-16">
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl">
                        <h2 className="text-4xl font-bold mb-4">Global Disaster Monitoring & Alert System</h2>
                        <p className="text-xl mb-8">Track disasters worldwide in real-time with our advanced global monitoring platform. Set custom alerts for any region around the world.</p>
                        <div className="flex flex-wrap gap-4">
                            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium transition flex items-center">
                                <Bell className="h-5 w-5 mr-2" />
                                Enable Global Alerts
                            </button>
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium transition flex items-center">
                                <Globe className="h-5 w-5 mr-2" />
                                Worldwide Coverage
                            </button>
                            <button className="bg-transparent border border-white text-white px-6 py-3 rounded-md font-medium hover:bg-white hover:text-gray-900 transition">
                                Set Your Locations
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Controls */}
            <div className="container mx-auto px-4 py-4">
                <div className="bg-white p-4 rounded-xl shadow-md mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setView('map')}
                                className={`px-4 py-2 rounded-md flex items-center ${view === 'map' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                            >
                                <MapPin className="h-4 w-4 mr-2" />
                                2D Map
                            </button>
                            <button
                                onClick={() => setView('globe')}
                                className={`px-4 py-2 rounded-md flex items-center ${view === 'globe' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                            >
                                <Globe className="h-4 w-4 mr-2" />
                                3D Globe
                            </button>
                        </div>

                        <div className="flex gap-4">
                            <div className="relative">
                                <select
                                    value={continent}
                                    onChange={(e) => setContinent(e.target.value)}
                                    className="appearance-none bg-gray-100 border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                                >
                                    <option value="all">All Continents</option>
                                    <option value="asia">Asia</option>
                                    <option value="africa">Africa</option>
                                    <option value="north_america">North America</option>
                                    <option value="south_america">South America</option>
                                    <option value="europe">Europe</option>
                                    <option value="oceania">Australia/Oceania</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <ChevronDown className="h-4 w-4" />
                                </div>
                            </div>

                            <div className="relative">
                                <select
                                    value={disasterType}
                                    onChange={(e) => setDisasterType(e.target.value)}
                                    className="appearance-none bg-gray-100 border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                                >
                                    <option value="all">All Disaster Types</option>
                                    <option value="wildfire">Wildfire</option>
                                    <option value="flood">Flood</option>
                                    <option value="earthquake">Earthquake</option>
                                    <option value="storm">Storm</option>
                                    <option value="hurricane">Hurricane</option>
                                    <option value="tsunami">Tsunami</option>
                                    <option value="drought">Drought</option>
                                    <option value="tornado">Tornado</option>
                                    <option value="landslide">Landslide</option>
                                    <option value="cyclone">Cyclone</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <ChevronDown className="h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm flex items-center">
                                    <span className="w-2 h-2 bg-red-600 rounded-full mr-1"></span>
                                    High
                                </span>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm flex items-center">
                                    <span className="w-2 h-2 bg-yellow-600 rounded-full mr-1"></span>
                                    Medium
                                </span>
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center">
                                    <span className="w-2 h-2 bg-green-600 rounded-full mr-1"></span>
                                    Low
                                </span>
                            </div>

                            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm flex items-center">
                                <Download className="h-4 w-4 mr-1" />
                                Export Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <section className="container mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Map/Globe */}
                    <div className="lg:w-2/3 bg-white p-4 rounded-xl shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                                {view === 'map' ? (
                                    <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                                ) : (
                                    <Globe className="w-5 h-5 mr-2 text-blue-600" />
                                )}
                                {view === 'map' ? 'Global Disaster Map' : '3D Global Disaster View'}
                            </h3>
                            <div className="text-sm text-gray-600">
                                Showing {filteredDisasters.length} of {activeDisasters.length} disasters
                            </div>
                        </div>

                        {loading ? (
                            <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : view === 'map' ? (
                            <div className="h-96 rounded-lg overflow-hidden">
                                <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }} maxBounds={[[-90, -180], [90, 180]]}>
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    />
                                    {filteredDisasters.map(disaster => {
                                        const markerStyle = getSeverityMarkerColor(disaster.severity);
                                        return (
                                            <CircleMarker
                                                key={disaster.id}
                                                center={[disaster.lat, disaster.lng]}
                                                radius={markerStyle.radius}
                                                pathOptions={{
                                                    fillColor: markerStyle.color,
                                                    color: markerStyle.color,
                                                    fillOpacity: 0.7
                                                }}
                                            >
                                                <Popup>
                                                    <div className="p-1">
                                                        <div className="flex items-center mb-2">
                                                            {getDisasterIcon(disaster.type)}
                                                            <h3 className="font-bold ml-2">{disaster.type.toUpperCase()}</h3>
                                                        </div>
                                                        <p><strong>Location:</strong> {disaster.location}</p>
                                                        <p><strong>Severity:</strong> {disaster.severity}</p>
                                                        <p><strong>Continent:</strong> {disaster.continent.replace('_', ' ')}</p>
                                                        <button className="mt-2 bg-blue-600 text-white px-3 py-1 rounded-md text-sm w-full">
                                                            View Details
                                                        </button>
                                                    </div>
                                                </Popup>
                                            </CircleMarker>
                                        );
                                    })}
                                </MapContainer>
                            </div>
                        ) : (
                            <div ref={globeRef} className="h-96 rounded-lg bg-gray-800">
                                {/* This would be replaced with a real THREE.js globe visualization */}
                                <div className="h-full flex items-center justify-center text-white flex-col">
                                    <Globe className="w-16 h-16 mb-4 text-blue-300" />
                                    <p className="text-lg">3D Globe Visualization</p>
                                    <p className="text-sm text-gray-300 mt-2">Showing {filteredDisasters.length} disasters worldwide</p>
                                </div>
                            </div>
                        )}

                        <div className="mt-4 text-sm text-gray-600 flex justify-between items-center">
                            <p>Last updated: 2 minutes ago</p>
                            <div className="flex items-center">
                                <Info className="w-4 h-4 mr-1 text-blue-600" />
                                <span>Click on disaster points for detailed information</span>
                            </div>
                        </div>
                    </div>

                    {/* Alerts Panel */}
                    <div className="lg:w-1/3 bg-white p-4 rounded-xl shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                                <Bell className="w-5 h-5 mr-2 text-red-600" />
                                Global Alerts
                            </h3>
                            <span className="text-sm text-blue-600 cursor-pointer">View All</span>
                        </div>

                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {notifications.map(alert => (
                                <div key={alert.id} className="border rounded-lg p-3 hover:bg-gray-50 transition">
                                    <div className="flex justify-between">
                                        <div className="flex items-center">
                                            {alert.type === 'Wildfire' && <Flame className="w-5 h-5 text-red-500 mr-2" />}
                                            {alert.type === 'Flood' && <Waves className="w-5 h-5 text-blue-500 mr-2" />}
                                            {alert.type === 'Storm' && <Wind className="w-5 h-5 text-gray-500 mr-2" />}
                                            {alert.type === 'Earthquake' && <Activity className="w-5 h-5 text-yellow-500 mr-2" />}
                                            {alert.type === 'Tsunami' && <Waves className="w-5 h-5 text-indigo-500 mr-2" />}
                                            <span className="font-medium">{alert.type}</span>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${alert.severity === 'High' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {alert.severity}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-gray-600">{alert.location}</p>
                                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                                        <span>{alert.time}</span>
                                        <span className="text-blue-600 cursor-pointer">Details</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6">
                            <h4 className="font-medium mb-2 flex items-center">
                                <Shield className="w-4 h-4 mr-1 text-blue-600" />
                                International Safety Updates
                            </h4>
                            <div className="space-y-3">
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div className="flex items-center">
                                        <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                                        <div>
                                            <p className="font-medium">Travel Advisory: Southeast Asia</p>
                                            <p className="text-sm text-gray-600">Increased flood risk in coastal regions</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center">
                                        <Info className="w-5 h-5 text-blue-600 mr-2" />
                                        <div>
                                            <p className="font-medium">Relief Efforts: East Africa</p>
                                            <p className="text-sm text-gray-600">Drought response coordination underway</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Global Stats Section */}
            <section className="bg-gray-100 py-12">
                <div className="container mx-auto px-4">
                    <h3 className="text-2xl font-bold text-center mb-10">Global Disaster Statistics</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <div className="flex items-center mb-4">
                                <div className="bg-indigo-100 p-3 rounded-full mr-4">
                                    <Globe className="w-6 h-6 text-indigo-600" />
                                </div>
                                <span className="text-4xl font-bold text-gray-800">384</span>
                            </div>
                            <p className="text-gray-600">Active Disaster Zones Worldwide</p>
                            <div className="mt-4 flex items-center text-red-600">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                <span className="text-sm">8% increase from last month</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <div className="flex items-center mb-4">
                                <div className="bg-red-100 p-3 rounded-full mr-4">
                                    <Flame className="w-6 h-6 text-red-600" />
                                </div>
                                <span className="text-4xl font-bold text-gray-800">142</span>
                            </div>
                            <p className="text-gray-600">Wildfires This Month</p>
                            <div className="mt-4 flex items-center text-red-600">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                <span className="text-sm">12% increase globally</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <div className="flex items-center mb-4">
                                <div className="bg-blue-100 p-3 rounded-full mr-4">
                                    <Waves className="w-6 h-6 text-blue-600" />
                                </div>
                                <span className="text-4xl font-bold text-gray-800">78</span>
                            </div>
                            <p className="text-gray-600">Flood Warnings Active</p>
                            <div className="mt-4 flex items-center text-yellow-600">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                <span className="text-sm">5% increase since last month</span>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <div className="flex items-center mb-4">
                                <div className="bg-green-100 p-3 rounded-full mr-4">
                                    <Shield className="w-6 h-6 text-green-600" />
                                </div>
                                <span className="text-4xl font-bold text-gray-800">45M+</span>
                            </div>
                            <p className="text-gray-600">People Protected by Alerts</p>
                            <div className="mt-4 flex items-center text-green-600">
                                <TrendingUp className="w-4 h-4 mr-1" />
                                <span className="text-sm">24% increase in coverage</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Continental Risk Assessment */}
            <section className="container mx-auto px-4 py-16">
                <h3 className="text-2xl font-bold text-center mb-12">Continental Risk Assessment</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500">
                        <h4 className="text-xl font-semibold mb-3">Asia Pacific</h4>
                        <p className="text-gray-600 mb-4">Highest concentration of active disasters with significant tsunami and earthquake activity.</p>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Risk Level:</span>
                            <span className="text-red-600 font-medium">High (72 active events)</span>
                        </div>
                        <div className="mt-3w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-red-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                    </div>      <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500">
                        <h4 className="text-xl font-semibold mb-3">Americas</h4>
                        <p className="text-gray-600 mb-4">Wildfires and hurricanes dominate with increasing frequency due to climate patterns.</p>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Risk Level:</span>
                            <span className="text-orange-600 font-medium">Medium-High (58 active events)</span>
                        </div>
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-orange-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
                        <h4 className="text-xl font-semibold mb-3">Africa</h4>
                        <p className="text-gray-600 mb-4">Drought conditions worsening in East Africa with localized flood risks in coastal areas.</p>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Risk Level:</span>
                            <span className="text-yellow-600 font-medium">Medium (42 active events)</span>
                        </div>
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '55%' }}></div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                        <h4 className="text-xl font-semibold mb-3">Europe</h4>
                        <p className="text-gray-600 mb-4">Flood risks increasing in Western Europe with severe storm systems becoming more common.</p>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Risk Level:</span>
                            <span className="text-blue-600 font-medium">Medium (36 active events)</span>
                        </div>
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
                        <h4 className="text-xl font-semibold mb-3">Oceania</h4>
                        <p className="text-gray-600 mb-4">Cyclone season brings heightened risks to coastal communities and island nations.</p>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Risk Level:</span>
                            <span className="text-green-600 font-medium">Low-Medium (28 active events)</span>
                        </div>
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
                        <h4 className="text-xl font-semibold mb-3">Antarctica</h4>
                        <p className="text-gray-600 mb-4">Ice shelf instability increasing with minimal direct human impact but global consequences.</p>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Risk Level:</span>
                            <span className="text-purple-600 font-medium">Monitoring (5 active events)</span>
                        </div>
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Geo Alert</h4>
                            <p className="text-gray-400">Providing real-time disaster monitoring and alerts worldwide to help protect communities and save lives.</p>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white transition">Home</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition">Global Map</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition">Alerts</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition">Report Incident</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition">Resources</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold mb-4">Resources</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white transition">Emergency Contacts</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition">Preparedness Guides</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition">Disaster Research</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition">API Documentation</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition">Data Sources</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg font-semibold mb-4">Connect</h4>
                            <div className="flex space-x-4 mb-4">
                                <a href="#" className="bg-gray-800 hover:bg-gray-700 p-2 rounded-full transition">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                    </svg>
                                </a>
                                <a href="#" className="bg-gray-800 hover:bg-gray-700 p-2 rounded-full transition">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </a>
                                <a href="#" className="bg-gray-800 hover:bg-gray-700 p-2 rounded-full transition">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748 1.857.344.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                                    </svg>
                                </a>
                            </div>
                            <p className="text-gray-400 mb-2">Email: GeoAlert_Codethon@gmail.com</p>
                            <p className="text-gray-400">Emergency Hotline: +91 9999999999</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>© 2025 Geo Alert. All rights reserved.</p>
                        <p className="mt-2 text-sm">Data sources: NASA FIRMS, USGS, NOAA, GDACS, and other international monitoring agencies</p>
                    </div>
                </div>
            </footer>
        </div>);
};

export default HomePage;