import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON, ZoomControl } from 'react-leaflet';
import { Bell, TrendingUp, MapPin, Flame, Waves, Wind, Globe, Shield, AlertTriangle, Activity, Download, ChevronDown, Info, Layers, Search, Zap, ThermometerSun, Target, BarChart2, Filter } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import * as THREE from 'three';
import axios from 'axios';

const HomePage = () => {
    const [activeDisasters, setActiveDisasters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [liveEvents, setLiveEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [disasterType, setDisasterType] = useState('all');
    const [userLocation, setUserLocation] = useState(null);
    const [mapView, setMapView] = useState(null); // standard, satellite, terrain
    const [mapTheme, setMapTheme] = useState('light'); // light, dark
    const [heatmapVisible, setHeatmapVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [notifications, setNotifications] = useState([
        { id: 1, type: 'Wildfire', location: 'Uttarakhand Hills, India', severity: 'High', time: '10 mins ago' },
        { id: 2, type: 'Flood', location: 'Mumbai Suburbs, India', severity: 'Medium', time: '25 mins ago' },
        { id: 3, type: 'Storm', location: 'Chennai Coast, India', severity: 'High', time: '42 mins ago' },
        { id: 4, type: 'Earthquake', location: 'Tokyo, Japan', severity: 'High', time: '1 hour ago' },
        { id: 5, type: 'Tsunami', location: 'Bali, Indonesia', severity: 'High', time: '2 hours ago' },
        { id: 6, type: 'Wildfire', location: 'California, USA', severity: 'Medium', time: '3 hours ago' },
    ]);
    const [continent, setContinent] = useState('all');
    const [timeRange, setTimeRange] = useState('all');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const mapRef = useRef(null);

    // Fetch Disaster Events
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/events`);
                if (response.data.events) {
                    setLiveEvents(response.data.events);
                    console.log(response.data.events);
                } else {
                    console.error("Unexpected API response format:", response.data);
                }
            } catch (error) {
                console.error("Error fetching events:", error);
                // Use mock data if API fails
                setMockData();
            } finally {
                setLoading(false);
            }
        };

        const setMockData = () => {
            setLiveEvents([
                {
                    id: 1,
                    title: "California Wildfire",
                    description: "Major wildfire spreading in Northern California",
                    categories: [{ title: "Wildfires" }],
                    geometries: [{ coordinates: [-122.4194, 37.7749] }],
                    link: "#",
                    severity: "high"
                },
                {
                    id: 2,
                    title: "Mumbai Flooding",
                    description: "Severe flooding in Mumbai suburbs after heavy rainfall",
                    categories: [{ title: "Floods" }],
                    geometries: [{ coordinates: [72.8777, 19.0760] }],
                    link: "#",
                    severity: "medium"
                },
                {
                    id: 3,
                    title: "Tokyo Earthquake",
                    description: "6.4 magnitude earthquake near Tokyo",
                    categories: [{ title: "Earthquakes" }],
                    geometries: [{ coordinates: [139.6503, 35.6762] }],
                    link: "#",
                    severity: "high"
                },
                {
                    id: 4,
                    title: "Hurricane Atlantic",
                    description: "Category 3 hurricane approaching East Coast",
                    categories: [{ title: "Storms" }],
                    geometries: [{ coordinates: [-80.1918, 25.7617] }],
                    link: "#",
                    severity: "high"
                },
                {
                    id: 5,
                    title: "Australian Drought",
                    description: "Extreme drought conditions affecting agriculture",
                    categories: [{ title: "Drought" }],
                    geometries: [{ coordinates: [151.2093, -33.8688] }],
                    link: "#",
                    severity: "medium"
                },
            ]);
        };

        fetchEvents();
    }, []);

    // Fetch Disaster Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/categories`);
                if (response.data.categories) {
                    setCategories(response.data.categories);
                } else {
                    console.error("Unexpected API response format:", response.data);
                    // Set default categories
                    setCategories([
                        { title: "Wildfires" },
                        { title: "Floods" },
                        { title: "Earthquakes" },
                        { title: "Storms" },
                        { title: "Drought" },
                        { title: "Volcanoes" },
                        { title: "Landslides" }
                    ]);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
                // Set default categories
                setCategories([
                    { title: "Wildfires" },
                    { title: "Floods" },
                    { title: "Earthquakes" },
                    { title: "Storms" },
                    { title: "Drought" },
                    { title: "Volcanoes" },
                    { title: "Landslides" }
                ]);
            }
        };
        fetchCategories();
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

    // Mock active disaster data
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
        }, 1500);
    }, []);

    // Get icon based on disaster type
    const getDisasterIcon = (type) => {
        switch (type.toLowerCase()) {
            case 'wildfire':
            case 'wildfires':
                return <Flame className="w-1 h-1 text-red-600" />;
            case 'flood':
            case 'floods':
                return <Waves className="w-1 h-1 text-blue-600" />;
            case 'storm':
            case 'storms':
            case 'hurricane':
            case 'cyclone':
                return <Wind className="w-1 h-1 text-gray-600" />;
            case 'earthquake':
            case 'earthquakes':
                return <Activity className="w-1 h-1 text-yellow-600" />;
            case 'tsunami':
                return <Waves className="w-1 h-1 text-indigo-600" />;
            case 'drought':
                return <ThermometerSun className="w-1 h-1 text-orange-600" />;
            case 'tornado':
                return <Wind className="w-1 h-1 text-purple-600" />;
            case 'landslide':
            case 'landslides':
                return <AlertTriangle className="w-1 h-1 text-amber-600" />;
            case 'volcanoes':
                return <Flame className="w-1 h-1 text-red-800" />;
            default:
                return <MapPin className="w-1 h-1 text-yellow-600" />;
        }
    };

    const DisasterColor = (category) => {
        const categoryColors = {
            "Wildfires": { color: "#FF4500", radius: 18, pulseColor: "rgba(255, 69, 0, 0.3)" },
            "Floods": { color: "#1E90FF", radius: 16, pulseColor: "rgba(30, 144, 255, 0.3)" },
            "Earthquakes": { color: "#FFD700", radius: 20, pulseColor: "rgba(255, 215, 0, 0.3)" },
            "Landslides": { color: "#8B4513", radius: 15, pulseColor: "rgba(139, 69, 19, 0.3)" },
            "Storms": { color: "#9370DB", radius: 19, pulseColor: "rgba(147, 112, 219, 0.3)" },
            "Drought": { color: "#FF8C00", radius: 17, pulseColor: "rgba(255, 140, 0, 0.3)" },
            "Volcanoes": { color: "#B22222", radius: 22, pulseColor: "rgba(178, 34, 34, 0.3)" },
        };
        return categoryColors[category] || { color: "#808080", radius: 15, pulseColor: "rgba(128, 128, 128, 0.3)" };
    };

    const getSeverityModifier = (severity) => {
        switch (severity) {
            case 'high': return 1.5;
            case 'medium': return 1.2;
            case 'low': return 1;
            default: return 1;
        }
    };

    // Filter disasters based on selected filters
    const filteredDisasters = liveEvents.filter((event) => {
        // Filter by disaster type
        const typeMatch = disasterType === 'all' ||
            (event.categories && event.categories.some(cat => cat.title.toLowerCase() === disasterType));

        // Filter by severity

        return typeMatch
    });

    // Get MapBox URL based on selected view and theme
    const getMapTileUrl = () => {
        if (mapView === 'terrain') {
            return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
        } else {
            // Standard view
            return mapTheme === 'dark'
                ? 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png'
                : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        }
    };

    // Toggle fullscreen map
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    // Get severity color class
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


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-800 to-indigo-900 shadow-lg">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <Globe className="h-8 w-8 text-white mr-2" />
                        <h1 className="text-2xl font-bold text-white">Geo Alert</h1>
                        <div className="ml-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs flex items-center">
                            <div className="w-1 h-1 bg-white rounded-full mr-1 animate-ping"></div>
                            LIVE
                        </div>
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

            {/* Map Controls - Enhanced */}
            <div className="container mx-auto px-4 py-4">
                <div className="bg-white p-4 rounded-xl shadow-md mb-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2">
                                <Filter className="h-5 w-5 text-gray-600 mr-2" />
                                <span className="text-gray-700 font-medium">Filters:</span>
                            </div>

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
                                    {categories.map((category, index) => (
                                        <option key={index} value={category.title.toLowerCase()}>
                                            {category.title}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <ChevronDown className="h-4 w-4" />
                                </div>
                            </div>



                            <div className="relative">
                                <select
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value)}
                                    className="appearance-none bg-gray-100 border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                                >
                                    <option value="all">All Time</option>
                                    <option value="24h">Last 24 Hours</option>
                                    <option value="7d">Last 7 Days</option>
                                    <option value="30d">Last 30 Days</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <ChevronDown className="h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm flex items-center">
                                    <span className="w-1 h-1 bg-red-600 rounded-full mr-1"></span>
                                    High
                                </span>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm flex items-center">
                                    <span className="w-1 h-1 bg-yellow-600 rounded-full mr-1"></span>
                                    Medium
                                </span>
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center">
                                    <span className="w-1 h-1 bg-green-600 rounded-full mr-1"></span>
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

            {/* Enhanced Map Section */}
            <section className="container mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Map Container with Enhanced Controls */}
                    <div className={`${isFullscreen ? 'fixed inset-0 z-50 p-4 bg-white' : 'lg:w-2/3'} bg-white p-4 rounded-xl shadow-md transition-all duration-300`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                                Disaster Monitoring Map
                            </h3>
                            <div className="text-sm text-gray-600">
                                Showing {filteredDisasters.length} active disaster events
                            </div>
                        </div>

                        {/* Map View Controls */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setMapView('standard')}
                                    className={`px-3 py-2 text-sm rounded-md flex items-center ${mapView === 'standard' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <Layers className="h-4 w-4 mr-1" />
                                    Standard
                                </button>
                                <button
                                    onClick={() => setMapView('terrain')}
                                    className={`px-3 py-2 text-sm rounded-md flex items-center ${mapView === 'terrain' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <BarChart2 className="h-4 w-4 mr-1" />
                                    Terrain
                                </button>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setMapTheme(mapTheme === 'light' ? 'dark' : 'light')}
                                    className="px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md text-sm flex items-center"
                                >
                                    {mapTheme === 'light' ? 'Dark Mode' : 'Light Mode'}
                                </button>
                                <button
                                    onClick={() => setHeatmapVisible(!heatmapVisible)}
                                    className={`px-3 py-2 rounded-md text-sm flex items-center ${heatmapVisible ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <Zap className="h-4 w-4 mr-1" />
                                    Heatmap
                                </button>
                                <button
                                    onClick={toggleFullscreen}
                                    className="px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md text-sm"
                                >
                                    {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg">
                                <div className="flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                    <p className="mt-4 text-gray-600">Loading disaster data...</p>
                                </div>
                            </div>
                        ) : (
                            <div className={`${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-96'} rounded-lg overflow-hidden relative shadow-inner`}>
                                <MapContainer
                                    center={[20, 0]}
                                    zoom={2}
                                    style={{ height: '100%', width: '100%' }}
                                    zoomControl={false}
                                    ref={mapRef}
                                >
                                    <TileLayer
                                        url={getMapTileUrl()}
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        subdomains={mapView === 'satellite' ? ['mt0', 'mt1', 'mt2', 'mt3'] : 'abc'}
                                    />
                                    <ZoomControl position="bottomright" />

                                    {/* User Location Marker */}
                                    {userLocation && (
                                        <CircleMarker
                                            center={[userLocation.lat, userLocation.lng]}
                                            radius={8}
                                            pathOptions={{
                                                fillColor: '#3b82f6',
                                                color: '#1d4ed8',
                                                weight: 2,
                                                opacity: 1,
                                                fillOpacity: 0.8
                                            }}
                                        />
                                    )}


                                    {/* Disaster Markers */}
                                    {filteredDisasters.map((disaster) => {
                                        const coordinates = disaster.geometries[0]?.coordinates || [0, 0];
                                        const markerStyle = DisasterColor(disaster.categories[0]?.title || "Unknown");
                                        const severityModifier = getSeverityModifier(disaster.severity);

                                        return (
                                            <CircleMarker
                                                key={disaster.id}
                                                center={[coordinates[1], coordinates[0]]}
                                                radius={markerStyle.radius * severityModifier}
                                                pathOptions={{
                                                    fillColor: markerStyle.color,
                                                    color: markerStyle.color,
                                                    weight: 1,
                                                    opacity: 0.8,
                                                    fillOpacity: 0.7,
                                                }}
                                                eventHandlers={{
                                                    click: () => {
                                                        setSelectedEvent(disaster);
                                                    },
                                                }}
                                            >
                                                <Popup>
                                                    <div className="max-w-xs">
                                                        <div className="flex items-center mb-2">
                                                            {getDisasterIcon(disaster.categories[0]?.title)}
                                                            <h3 className="font-bold text-lg ml-2">{disaster.title}</h3>
                                                        </div>
                                                        <p className="text-gray-700 mb-2">{disaster.description}</p>

                                                    </div>
                                                </Popup>
                                            </CircleMarker>
                                        );
                                    })}

                                    {/* Heatmap Layer (would be implemented with a proper heatmap library) */}
                                    {heatmapVisible && (
                                        <GeoJSON
                                            data={{
                                                type: "FeatureCollection",
                                                features: filteredDisasters.map(disaster => ({
                                                    type: "Feature",
                                                    geometry: {
                                                        type: "Point",
                                                        coordinates: disaster.geometries[0]?.coordinates || [0, 0]
                                                    },
                                                    properties: {
                                                        intensity: disaster.severity === 'high' ? 1 :
                                                            disaster.severity === 'medium' ? 0.7 : 0.4
                                                    }
                                                }))
                                            }}
                                            style={() => ({
                                                radius: 20,
                                                fillOpacity: 0.6,
                                                color: 'red',
                                                weight: 1
                                            })}
                                        />
                                    )}
                                </MapContainer>

                                {/* Search Box */}
                                <div className="absolute top-4 left-4 z-[1000] bg-white p-2 rounded-md shadow-md">
                                    <div className="flex items-center">
                                        <Search className="h-5 w-5 text-gray-500 mr-2" />
                                        <input
                                            type="text"
                                            placeholder="Search location..."
                                            className="border-none outline-none text-gray-700 w-48"
                                        />
                                    </div>
                                </div>

                                {/* Legend */}
                                <div className="absolute bottom-4 left-4 z-[1000] bg-white p-3 rounded-md shadow-md">
                                    <h4 className="font-medium text-gray-800 mb-2">Disaster Legend</h4>
                                    <div className="space-y-2">
                                        {categories.map((category) => {
                                            const style = DisasterColor(category.title);
                                            return (
                                                <div key={category.title} className="flex items-center">
                                                    <div
                                                        className="w-4 h-4 rounded-full mr-2"
                                                        style={{ backgroundColor: style.color }}
                                                    ></div>
                                                    <span className="text-sm text-gray-700">{category.title}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Events and Notifications */}
                    <div className={`${isFullscreen ? 'hidden' : 'lg:w-1/3'} space-y-6`}>
                        {/* Active Disasters Card */}
                        <div className="bg-white p-4 rounded-xl shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                                    Active Disasters
                                </h3>
                                <span className="text-sm text-gray-500">{filteredDisasters.length} events</span>
                            </div>

                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                {filteredDisasters.length > 0 ? (
                                    filteredDisasters.map((disaster) => {
                                        const coordinates = disaster.geometries[0]?.coordinates || [0, 0];
                                        const markerStyle = DisasterColor(disaster.categories[0]?.title || "Unknown");

                                        return (
                                            <div
                                                key={disaster.id}
                                                className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition ${selectedEvent?.id === disaster.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                                                onClick={() => {
                                                    setSelectedEvent(disaster);
                                                    if (mapRef.current) {
                                                        mapRef.current.flyTo([coordinates[1], coordinates[0]], 8);
                                                    }
                                                }}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-start">
                                                        <div className="p-1 rounded-full mr-3" style={{ backgroundColor: markerStyle.pulseColor }}>
                                                            {getDisasterIcon(disaster.categories[0]?.title)}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-gray-800">{disaster.title}</h4>
                                                            <p className="text-sm text-gray-600">{'Unknown location'}</p>
                                                        </div>
                                                    </div>

                                                </div>
                                                <p className="text-sm text-gray-700 mt-2 line-clamp-2">{disaster.description}</p>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-xs text-gray-500">
                                                        {new Date().toLocaleString()}
                                                    </span>
                                                    <a
                                                        href={disaster.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-blue-600 hover:underline"
                                                    >
                                                        Details
                                                    </a>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        No active disasters matching your filters
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notifications Card */}
                        <div className="bg-white p-4 rounded-xl shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <Bell className="w-5 h-5 mr-2 text-blue-600" />
                                    Recent Alerts
                                </h3>
                                <span className="text-sm text-gray-500">{notifications.length} notifications</span>
                            </div>

                            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                {notifications.map((notification) => (
                                    <div key={notification.id} className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-start">
                                                <div className="p-1 rounded-full mr-3 bg-gray-100">
                                                    {getDisasterIcon(notification.type)}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-800">{notification.type}</h4>
                                                    <p className="text-sm text-gray-600">{notification.location}</p>
                                                </div>
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(notification.severity)}`}>
                                                {notification.severity}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-xs text-gray-500">
                                                {notification.time}
                                            </span>
                                            <button className="text-xs text-blue-600 hover:underline">
                                                View
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Statistics Card */}
                        <div className="bg-white p-4 rounded-xl shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                                    Disaster Statistics
                                </h3>
                                <span className="text-sm text-gray-500">Last 30 days</span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-700">Wildfires</span>
                                        <span className="font-medium">24 incidents</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-red-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-700">Floods</span>
                                        <span className="font-medium">18 incidents</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '55%' }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-700">Earthquakes</span>
                                        <span className="font-medium">12 incidents</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-700">Storms</span>
                                        <span className="font-medium">8 incidents</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Selected Event Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[2000] p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-slate-700">
                        {/* Header with pulse animation for critical alerts */}
                        <div className={`p-6 ${selectedEvent.severity === 'critical' ? 'bg-red-50 dark:bg-red-950/30' : ''}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center">
                                        <div className={`p-2 rounded-full ${selectedEvent.severity === 'critical' ? 'animate-pulse bg-red-100 dark:bg-red-900/40' : 'bg-gray-100 dark:bg-slate-800'}`}>
                                            {getDisasterIcon(selectedEvent.categories[0]?.title)}
                                        </div>
                                        <h3 className="text-2xl font-bold ml-3 dark:text-white">{selectedEvent.title}</h3>
                                    </div>

                                </div>
                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                    aria-label="Close dialog"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Main content */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Left column with map and timeline */}
                                <div className="space-y-4">
                                    <div className="h-56 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-md">
                                        <MapContainer
                                            center={selectedEvent.geometries[0]?.coordinates ?
                                                [selectedEvent.geometries[0].coordinates[1], selectedEvent.geometries[0].coordinates[0]] :
                                                [20, 0]}
                                            zoom={8}
                                            style={{ height: '100%', width: '100%' }}
                                            zoomControl={true}
                                            attributionControl={false}
                                        >
                                            <TileLayer
                                                url={getMapTileUrl()}
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            />
                                            <CircleMarker
                                                center={selectedEvent.geometries[0]?.coordinates ?
                                                    [selectedEvent.geometries[0].coordinates[1], selectedEvent.geometries[0].coordinates[0]] :
                                                    [20, 0]}
                                                radius={10}
                                                pathOptions={{
                                                    fillColor: '#ef4444',
                                                    color: '#b91c1c',
                                                    weight: 2,
                                                    opacity: 1,
                                                    fillOpacity: 0.8
                                                }}
                                            />
                                            {/* Add radius circle for impact zone - if data available */}
                                            {selectedEvent.impactRadius && (
                                                <Circle
                                                    center={[selectedEvent.geometries[0].coordinates[1], selectedEvent.geometries[0].coordinates[0]]}
                                                    radius={selectedEvent.impactRadius * 1000}
                                                    pathOptions={{
                                                        color: '#dc2626',
                                                        weight: 1,
                                                        opacity: 0.6,
                                                        fillOpacity: 0.2
                                                    }}
                                                />
                                            )}
                                        </MapContainer>
                                    </div>

                                    {/* Timeline of event updates - if multiple geometries/timestamps exist */}
                                    {selectedEvent.geometries.length > 1 && (
                                        <div className="rounded-xl bg-gray-50 dark:bg-slate-800 p-4">
                                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Event Timeline</h4>
                                            <div className="relative pl-6 space-y-3 max-h-32 overflow-y-auto">
                                                <div className="absolute h-full w-0.5 bg-gray-200 dark:bg-gray-700 left-2"></div>
                                                {selectedEvent.geometries.map((geo, index) => (
                                                    <div key={index} className="relative">
                                                        <div className="absolute w-3 h-3 rounded-full bg-blue-500 -left-5 top-1.5 z-10"></div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {new Date(geo.date).toLocaleString("en-US", {
                                                                month: "short",
                                                                day: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            })}
                                                        </p>
                                                        <p className="text-sm">
                                                            {index === 0 ? 'Event first reported' : `Update ${index}`}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right column with details */}
                                <div className="space-y-5">
                                    <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl">
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</h4>
                                        <p className="text-gray-800 dark:text-gray-200">{selectedEvent?.description || "No description available"}</p>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-xl">
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Details</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">Category</span>
                                                <p className="font-medium text-gray-800 dark:text-gray-200">{selectedEvent.categories[0]?.title || 'Unknown'}</p>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">Reported</span>
                                                <p className="font-medium text-gray-800 dark:text-gray-200">
                                                    {new Date(selectedEvent.geometries[0].date).toLocaleString("en-US", {
                                                        month: "long",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: true
                                                    })}
                                                </p>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">Coordinates</span>
                                                <p className="font-medium text-gray-800 dark:text-gray-200">
                                                    {selectedEvent.geometries[0].coordinates[1].toFixed(4)}°, {selectedEvent.geometries[0].coordinates[0].toFixed(4)}°
                                                </p>
                                            </div>

                                            <div className="pt-1">
                                                <span className="text-sm text-gray-500 dark:text-gray-400">Source</span>
                                                <a
                                                    href={selectedEvent.sources[0].url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center mt-1 font-medium"
                                                >
                                                    View official report
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Safety Recommendations with adaptive content based on disaster type */}
                            <div className="border-t border-gray-200 dark:border-slate-700 pt-5">
                                <div className="flex items-center mb-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h4 className="font-semibold text-gray-800 dark:text-white">Safety Recommendations</h4>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                                    <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                                        <li>Follow local authority instructions and evacuation orders</li>
                                        <li>Prepare emergency supplies if in affected area</li>
                                        <li>Monitor official updates through emergency broadcast systems</li>
                                        <li>Avoid unnecessary travel to impacted regions</li>
                                        {selectedEvent.categories[0]?.title === 'Wildfire' && (
                                            <>
                                                <li>Keep windows and doors closed to prevent smoke inhalation</li>
                                                <li>Prepare important documents and medications for possible evacuation</li>
                                            </>
                                        )}
                                        {selectedEvent.categories[0]?.title === 'Severe Storm' && (
                                            <>
                                                <li>Stay indoors and away from windows during high winds</li>
                                                <li>Prepare for potential power outages with flashlights and batteries</li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* Action buttons with improved styling and accessibility */}
                            <div className="flex flex-wrap gap-3 mt-6 sm:justify-between">
                                <div className="flex gap-2">
                                    <button
                                        className="px-3 py-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition border border-gray-200 dark:border-slate-700 text-sm font-medium flex items-center"
                                        title="Save this alert to your bookmarks"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                        </svg>
                                        Save
                                    </button>
                                    <button
                                        className="px-3 py-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition border border-gray-200 dark:border-slate-700 text-sm font-medium flex items-center"
                                        title="Share this alert with others"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                        </svg>
                                        Share
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-4 py-2 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition border border-blue-200 dark:border-blue-800 text-sm font-medium">
                                        View Resources
                                    </button>
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                        Get Help
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;