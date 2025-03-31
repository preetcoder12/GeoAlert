import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON, ZoomControl } from 'react-leaflet';
import { Bell, TrendingUp, MapPin, Flame, Waves, Wind, Globe, Shield, AlertTriangle, Activity, Download, ChevronDown, Info, Layers, Search, Zap, ThermometerSun, Target, BarChart2, Filter } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { useMap } from 'react-leaflet';
import { useNavigate } from "react-router-dom";
import MarkerClusterGroup from 'react-leaflet-cluster';
import { CiLogout } from "react-icons/ci";
import { FaLocationDot } from "react-icons/fa6";


const HomePage = () => {
    const [activeDisasters, setActiveDisasters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [liveEvents, setLiveEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [disasterType, setDisasterType] = useState('all');
    const [userLocation, setUserLocation] = useState(null);
    const [mapView, setMapView] = useState(null);
    const [mapTheme, setMapTheme] = useState('light');
    const [heatmapVisible, setHeatmapVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [legend, setLegend] = useState(false);
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
    const [bounds, setBounds] = useState(null);
    const [visibleEvents, setVisibleEvents] = useState(50);
    const [mapReady, setMapReady] = useState(false);
    const [location, setLocation] = useState("");
    const mapRef = useRef(null);
    const navigate = useNavigate();

    const toggleLegend = () => {
        setLegend(prev => !prev);
    };

    const updateBounds = (map) => {
        if (map) {
            setBounds(map.getBounds());
        }
    };






    // Optimized event fetching with viewport filtering
    const fetchEvents = useCallback(async () => {
        try {
            const params = {
                disasterType: disasterType !== 'all' ? disasterType : undefined,
                continent: continent !== 'all' ? continent : undefined,
                timeRange: timeRange !== 'all' ? timeRange : undefined,
                bounds: bounds ? [
                    bounds.getSouthWest().lat,
                    bounds.getSouthWest().lng,
                    bounds.getNorthEast().lat,
                    bounds.getNorthEast().lng
                ] : undefined
            };

            const response = await axios.get(`http://localhost:8000/api/events`, { params });
            if (response.data.events) {
                setLiveEvents(response.data.events);
            }
            console.log(response.data.events)
        } catch (error) {
            console.error("Error fetching events:", error);
            setMockData();
        } finally {
            setLoading(false);
        }
    }, [disasterType, continent, timeRange, bounds]);

    const setMockData = () => {
        setLiveEvents([
            {
                id: 1,
                title: "California Wildfire",
                description: "Major wildfire spreading in Northern California",
                categories: [{ title: "Wildfires" }],
                geometries: [{ coordinates: [-122.4194, 37.7749] }],
                link: "#",
                severity: "high",
                date: "2023-06-15T08:30:00Z",
                status: "Ongoing",
                affectedArea: "5000 acres",
                casualties: "None reported",
                sources: ["NASA FIRMS", "CAL FIRE"],
                continent: "north_america" // Add this

            },
            {
                id: 2,
                title: "Mumbai Flooding",
                description: "Severe flooding in Mumbai suburbs after heavy rainfall",
                categories: [{ title: "Floods" }],
                geometries: [{ coordinates: [72.8777, 19.0760] }],
                link: "#",
                severity: "medium",
                date: "2023-06-14T14:45:00Z",
                status: "Ongoing",
                affectedArea: "Multiple districts",
                casualties: "12 injured",
                sources: ["NDMA", "Local Authorities"],
                continent: "asia" // Add this

            },
            {
                id: 3,
                title: "Tokyo Earthquake",
                description: "6.4 magnitude earthquake near Tokyo",
                categories: [{ title: "Earthquakes" }],
                geometries: [{ coordinates: [139.6503, 35.6762] }],
                link: "#",
                severity: "high",
                date: "2023-06-13T03:22:00Z",
                status: "Aftermath",
                affectedArea: "Tokyo metropolitan area",
                casualties: "3 fatalities, 24 injured",
                sources: ["JMA", "USGS"],
                continent: "asia" // Add this

            },
            {
                id: 4,
                title: "Hurricane Atlantic",
                description: "Category 3 hurricane approaching East Coast",
                categories: [{ title: "Storms" }],
                geometries: [{ coordinates: [-80.1918, 25.7617] }],
                link: "#",
                severity: "high",
                date: "2023-06-12T18:15:00Z",
                status: "Approaching",
                affectedArea: "Coastal regions",
                casualties: "None yet",
                sources: ["NOAA", "NHC"],
                continent: "north_america" // Add this

            },
            {
                id: 5,
                title: "Australian Drought",
                description: "Extreme drought conditions affecting agriculture",
                categories: [{ title: "Drought" }],
                geometries: [{ coordinates: [151.2093, -33.8688] }],
                link: "#",
                severity: "medium",
                date: "2023-06-10T00:00:00Z",
                status: "Ongoing",
                affectedArea: "New South Wales",
                casualties: "Economic impact",
                sources: ["BOM", "Local Reports"],
                continent: "north_america" // Add this

            },
        ]);
    };

    // Fetch Disaster Events
    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const getLocationFromCoords = async (lat, lon) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
            const data = await response.json();
            return data.display_name || "Unknown Location";
        } catch (error) {
            console.error("Error fetching location:", error);
            return "Location not found";
        }
    };

    useEffect(() => {
        if (selectedEvent?.geometries?.[0]?.coordinates) {
            const fetchLocation = async () => {
                const loc = await getLocationFromCoords(
                    selectedEvent.geometries[0].coordinates[1],
                    selectedEvent.geometries[0].coordinates[0]
                );
                setLocation(loc);
            };
            fetchLocation();
        }
    }, [selectedEvent]);

    const LimitMapBounds = () => {
        const map = useMap();

        useEffect(() => {
            map.setMaxBounds([
                [-85, -180],
                [85, 180]
            ]);
        }, [map]);

        return null;
    };

    // Fetch Disaster Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/categories`);
                if (response.data.categories) {
                    setCategories(response.data.categories);
                } else {
                    console.error("Unexpected API response format:", response.data);
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

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        navigate("/signup");
    };

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);

                    try {
                        const response = await axios.get(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                        );

                        if (response.data.display_name) {
                            setLocation(response.data.display_name);
                        } else {
                            setLocation("Location Not Found");
                        }
                        toast.success("Location already set");

                    } catch (error) {
                        console.error("Geocoding Error: ", error);
                        setLocation("Error Getting Location");
                    }
                },
                (error) => {
                    console.error("Geolocation Error:", error);
                    toast.error("Please enable location permissions in your browser settings");
                    setLocation("Permission Denied");
                }
            );
        } else {
            setLocation("Geolocation Not Supported");
        }
    };

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
        setTimeout(() => {
            setActiveDisasters([
                // Asia
                { id: 1, type: 'wildfire', lat: 28.7041, lng: 77.1025, severity: 'high', location: 'Delhi Outskirts, India', continent: 'asia' },
                { id: 2, type: 'flood', lat: 19.0760, lng: 72.8777, severity: 'medium', location: 'Mumbai Suburbs, India', continent: 'asia' },
                // North America
                { id: 7, type: 'wildfire', lat: 34.0522, lng: -118.2437, severity: 'medium', location: 'Los Angeles, USA', continent: 'north_america' },
                // Europe
                { id: 10, type: 'flood', lat: 48.8566, lng: 2.3522, severity: 'medium', location: 'Paris, France', continent: 'europe' },
                // Africa
                { id: 12, type: 'drought', lat: -1.2921, lng: 36.8219, severity: 'high', location: 'Nairobi, Kenya', continent: 'africa' },
                // South America
                { id: 14, type: 'landslide', lat: -22.9068, lng: -43.1729, severity: 'high', location: 'Rio de Janeiro, Brazil', continent: 'south_america' },
                // Oceania
                { id: 15, type: 'cyclone', lat: -33.8688, lng: 151.2093, severity: 'high', location: 'Sydney, Australia', continent: 'oceania' },
            ]);
        }, 1500);
    }, []);
    // Get icon based on disaster type
    const getDisasterIcon = (type) => {
        switch (type?.toLowerCase()) {
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

    const fetchDataAndExportCSV = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/events");
            console.log("Response status:", response.status);

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            console.log("API Response:", data); // Debugging step

            if (!data.events || !Array.isArray(data.events)) {
                console.error("Unexpected data format:", data);
                alert("Unexpected data format from server.");
                return;
            }

            if (data.events.length === 0) {
                console.warn("No events data received from API.");
                alert("No data available to export.");
                return;
            }

            const headers = Object.keys(data.events[0]);
            const csvRows = data.events.map(row => headers.map(header => row[header] ?? "").join(","));
            const csvData = [headers.join(","), ...csvRows].join("\n");

            const blob = new Blob([csvData], { type: "text/csv" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "events_data.csv";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            console.error("Error fetching or exporting data:", error);
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

    const [time, setTime] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(Date.now());
        }, 1000); // Updates every second

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "Unknown";
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? "Invalid date" : date.toLocaleString();
        } catch {
            return "Unknown";
        }
    };
    const filteredDisasters = useMemo(() => {
        return liveEvents.filter((event) => {
            // Match disaster type
            const typeMatch = disasterType === 'all' ||
                (event.categories && event.categories.some(cat =>
                    cat.title.toLowerCase() === disasterType
                ));

            // Match continent - handle both activeDisasters and liveEvents structures
            const continentMatch = continent === 'all' ||
                (event.continent && event.continent.toLowerCase() === continent) ||
                (event.location && event.location.continent && event.location.continent.toLowerCase() === continent);

            return typeMatch && continentMatch;
        });
    }, [liveEvents, disasterType, continent]);



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

    // Memoized markers for better performance
    const memoizedMarkers = useMemo(() => {
        return filteredDisasters.map((disaster) => {
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
                            setSelectedEvent({
                                ...disaster,
                                coordinates: coordinates // Store coordinates explicitly
                            });
                        },
                    }}
                >
                    <Popup className="event-details-popup">
                        <div className="max-w-xs">
                            <div className="flex items-center mb-2">
                                {getDisasterIcon(disaster.categories[0]?.title)}
                                <h3 className="font-bold text-lg ml-2">{disaster.title}</h3>
                            </div>
                            <p className="text-gray-700 mb-2 text-sm">{disaster.description}</p>
                            <div className="flex justify-between items-center">
                                <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(disaster.severity)}`}>
                                    {disaster.severity}
                                </span>
                                <button
                                    className="text-blue-600 text-xs hover:underline"
                                    onClick={() => {
                                        setSelectedEvent({
                                            ...disaster,
                                            coordinates: coordinates
                                        });
                                    }}
                                >
                                    More details
                                </button>
                            </div>
                        </div>
                    </Popup>
                </CircleMarker>
            );
        });
    }, [filteredDisasters]);

    // Get MapBox URL based on selected view and theme
    const getMapTileUrl = () => {
        if (mapView === 'terrain') {
            return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
        } else {
            return mapTheme === 'dark'
                ? 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png'
                : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        }
    };

    // Toggle fullscreen map
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-900 via-indigo-800 to-purple-900 shadow-lg">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    {/* Logo & Title */}
                    <div className="flex items-center">
                        <Globe className="h-8 w-8 text-green-400 mr-2" />
                        <h1 className="text-2xl font-extrabold text-white tracking-wide">Geo Alert</h1>

                        {/* Live Indicator */}
                        <div className="ml-3 bg-red-600 text-white px-2 py-1 rounded-md text-xs flex items-center shadow-lg">
                            <div className="w-2 h-2 bg-white rounded-full mr-1 animate-ping"></div>
                            LIVE
                        </div>

                        {/* Live Time */}
                        <h1 className="text-white ml-4 text-sm font-medium bg-black bg-opacity-30 px-3 py-1 rounded-lg">
                            {new Date(time).toLocaleString()}
                        </h1>
                    </div>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex space-x-6">
                        {["Dashboard", "Report Incident", "Global Alerts", "Resources", "Analytics"].map((item) => (
                            <a
                                key={item}
                                href="#"
                                className="text-white text-sm font-medium tracking-wide hover:text-green-300 transition duration-300 ease-in-out"
                            >
                                {item}
                            </a>
                        ))}
                    </nav>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="px-5 py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-lg shadow-lg font-semibold text-sm
             hover:from-red-600 hover:to-orange-700 transition-all duration-300 ease-in-out 
             active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-300 flex items-center space-x-2"
                    >
                        <CiLogout className="text-white text-lg" />
                        <span>Logout</span>
                    </button>


                </div>
            </header>


            {/* Hero Section */}
            <section className="relative bg-gray-900 text-white py-16">
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl">
                        <h2 className="text-4xl font-bold mb-4 text-white">
                            Global Disaster <span className="text-green-400">Monitoring & Alert System</span>
                        </h2>
                        <p className="text-xl mb-8">Track global disasters in real-time, receive instant alerts, and stay prepared with our advanced monitoring and customized region-based notifications.🌍</p>
                        <div className="flex flex-wrap gap-4">
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium transition flex items-center">
                                <Bell className="h-5 w-5 mr-2" />
                                Enable Global Alerts
                            </button>
                            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium transition flex items-center">
                                <Globe className="h-5 w-5 mr-2" />
                                <a href='/report' className="text-white">Report emergency</a>
                            </button>
                            <button
                                onClick={getLocation}
                                className="flex items-center space-x-2 bg-transparent border border-white text-white px-6 py-3 rounded-md font-medium 
             hover:bg-white hover:text-gray-900 transition duration-300 ease-in-out 
             active:scale-95 focus:outline-none focus:ring-2 focus:ring-white"
                            >
                                <FaLocationDot className="text-lg" />
                                <span>Set Your Location</span>
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
                                        <option value="oceania">Oceania</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <ChevronDown className="h-4 w-4" />
                                    </div>
                                </div>

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

                            <button
                                onClick={fetchDataAndExportCSV}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm flex items-center"
                            >
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
                                Showing {filteredDisasters.length} live active disaster events
                            </div>
                        </div>

                        {/* Map View Controls */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex space-x-2">
                                <button
                                    onClick={toggleLegend}
                                    className={`px-3 py-2 text-sm rounded-md flex items-center ${legend ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    <Layers className="h-4 w-4 mr-1" />
                                    Legend
                                </button>
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
                                    worldCopyJump={false}
                                    maxBounds={[[-85, -180], [85, 180]]}
                                    maxBoundsViscosity={1.0}
                                    dragging={true}
                                    whenReady={({ target: map }) => {
                                        updateBounds(map);
                                        map.on('moveend', () => updateBounds(map));
                                        setMapReady(true);
                                    }}
                                >
                                    <TileLayer
                                        url={getMapTileUrl()}
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        subdomains={['a', 'b', 'c']}
                                        noWrap={true}
                                    />

                                    <LimitMapBounds />
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

                                    {mapReady && (
                                        <MarkerClusterGroup
                                            chunkedLoading
                                            maxClusterRadius={60}
                                            spiderfyOnMaxZoom={true}
                                            showCoverageOnHover={true}
                                        >
                                            {memoizedMarkers}
                                        </MarkerClusterGroup>
                                    )}

                                    {/* Heatmap Layer */}
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
                                {legend && (
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
                                )}
                            </div>
                        )}
                        {/* Selected Event Details Card - Enhanced */}
                        {selectedEvent && (
                            <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 max-w-4xl mx-auto">
                                {/* Header with elegant styling */}
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                                    <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                                        <Info className="w-6 h-6 mr-3 text-blue-600" />
                                        Event Details
                                    </h3>
                                    <button
                                        onClick={() => setSelectedEvent(null)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-50"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    {/* Event headline with premium styling */}
                                    <div className="flex items-start gap-5">
                                        <div className={`p-5 rounded-2xl shadow-md ${getSeverityColor(selectedEvent.severity)}`}>
                                            {getDisasterIcon(selectedEvent.categories[0]?.title)}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-3xl text-gray-800 mb-3">{selectedEvent.title}</h4>
                                            <div className="flex items-center">
                                                <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 font-medium text-sm">
                                                    {selectedEvent.categories[0]?.title}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content sections with premium card styling */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Description card */}
                                        <div className="bg-gray-50 p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                            <h5 className="font-semibold text-gray-800 mb-3 flex items-center text-lg">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                                Description
                                            </h5>
                                            <p className="text-gray-700 leading-relaxed">{selectedEvent.description || "No description available"}</p>
                                        </div>

                                        {/* Location details card */}
                                        <div className="bg-gray-50 p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                            <h5 className="font-semibold text-gray-800 mb-3 flex items-center text-lg">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                </svg>
                                                Location Details
                                            </h5>
                                            <div className="space-y-3">
                                                <div className="flex items-start">
                                                    <span className="font-medium text-black w-32 inline-block">Coordinates:</span>
                                                    <span className="text-gray-700">{selectedEvent.geometries?.[0]?.coordinates
                                                        ? `${selectedEvent.geometries[0].coordinates[1].toFixed(4)}°, ${selectedEvent.geometries[0].coordinates[0].toFixed(4)}°`
                                                        : "Unknown"}
                                                    </span>
                                                </div>
                                                <div className="flex items-start">
                                                    <span className="font-medium text-black w-32 inline-block">Address:</span>
                                                    <span className="text-black">{typeof location === 'string' ? location : "Loading location..."}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Event Information card */}
                                        <div className="bg-gray-50 p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                            <h5 className="font-semibold text-gray-800 mb-3 flex items-center text-lg">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                </svg>
                                                Event Information
                                            </h5>
                                            <div className="space-y-3">
                                                <div className="flex items-start">
                                                    <span className="font-medium text-black w-32 inline-block">Date:</span>
                                                    <span className="text-gray-700">{formatDate(selectedEvent.geometries[0].date)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Data Sources card */}
                                        <div className="bg-gray-50 p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                            <h5 className="font-semibold text-gray-800 mb-3 flex items-center text-lg">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                                                </svg>
                                                Data Sources
                                            </h5>
                                            <div className="space-y-2">
                                                {selectedEvent.sources && selectedEvent.sources.length > 0 ? (
                                                    selectedEvent.sources.map((source, index) => (
                                                        <div key={index} className="flex items-center mb-2">
                                                            <span className="text-blue-600 mr-2">•</span>
                                                            <a
                                                                href={source.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                                            >
                                                                {source.url}
                                                            </a>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-gray-600 italic">No source information available</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action button with premium styling */}
                                    <div className="flex justify-center pt-6">
                                        <button
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-sm font-medium flex items-center transition-colors shadow-md hover:shadow-lg"
                                            onClick={() => {
                                                if (mapRef.current && selectedEvent.geometries?.[0]?.coordinates) {
                                                    mapRef.current.flyTo(
                                                        [selectedEvent.geometries[0].coordinates[1],
                                                        selectedEvent.geometries[0].coordinates[0]],
                                                        12
                                                    );
                                                }
                                            }}
                                        >
                                            <Target className="h-5 w-5 mr-3" />
                                            Zoom to Location
                                        </button>
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

                            <div
                                className="space-y-3 max-h-96 overflow-y-auto pr-2"
                                onScroll={(e) => {
                                    const { scrollTop, scrollHeight, clientHeight } = e.target;
                                    if (scrollHeight - scrollTop === clientHeight) {
                                        setVisibleEvents(prev => prev + 50);
                                    }
                                }}
                            >
                                {filteredDisasters.slice(0, visibleEvents).map((disaster) => {
                                    const coordinates = disaster.geometries[0]?.coordinates || [0, 0];
                                    const markerStyle = DisasterColor(disaster.categories[0]?.title || "Unknown");

                                    return (
                                        <div
                                            key={disaster.id}
                                            className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition ${selectedEvent?.id === disaster.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                                            onClick={() => {
                                                setSelectedEvent({
                                                    ...disaster,
                                                    coordinates: coordinates
                                                });
                                                if (mapRef.current) {
                                                    mapRef.current.flyTo([coordinates[1], coordinates[0]], 8);
                                                }
                                            }}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start">
                                                    <div className="p-1 rounded-full mr-3" style={{ backgroundColor: markerStyle.pulseColor }}>
                                                        <div
                                                            className="w-8 h-8 rounded-full flex items-center justify-center"
                                                            style={{ backgroundColor: markerStyle.color }}
                                                        >
                                                            {getDisasterIcon(disaster.categories[0]?.title)}
                                                        </div>
                                                    </div>
                                                    <div className="ml-2">
                                                        <h4 className="font-medium text-gray-800">{disaster.title}</h4>
                                                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{disaster.description}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(disaster.severity)}`}>
                                                        {disaster.severity}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between mt-2 text-xs text-gray-500">
                                                <span>Category: {disaster.categories[0]?.title}</span>
                                                <a href={disaster.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    Source
                                                </a>
                                            </div>
                                        </div>
                                    );
                                })}
                                {filteredDisasters.length === 0 && (
                                    <div className="p-4 text-center">
                                        <p className="text-gray-500">No disasters matching your filters</p>
                                    </div>
                                )}
                            </div>
                        </div>




                        {/* Recent Alerts Card */}
                        <div className="bg-white p-4 rounded-xl shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                                    <Bell className="w-5 h-5 mr-2 text-orange-600" />
                                    Recent Alerts
                                </h3>
                                <span className="text-sm text-gray-500">Last 24 hours</span>
                            </div>

                            <div className="space-y-3 max-h-60 overflow-y-auto">
                                {notifications.map((notification) => (
                                    <div key={notification.id} className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition cursor-pointer">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-start">
                                                <div className={`p-2 rounded-full mr-3 ${getSeverityColor(notification.severity.toLowerCase())}`}>
                                                    {getDisasterIcon(notification.type)}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-800">
                                                        {notification.type} Alert
                                                    </h4>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {notification.location}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500">{notification.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="mt-4 w-full text-blue-600 hover:text-blue-700 py-2 flex items-center justify-center font-medium text-sm">
                                View All Alerts
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Forecast and Trend Section */}
            <section className="container mx-auto px-4 py-8">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                            <TrendingUp className="w-6 w-6 mr-2 text-indigo-600" />
                            Disaster Forecast & Trends
                        </h3>
                        <div className="flex space-x-2">
                            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm">
                                Last 7 Days
                            </button>
                            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm">
                                This Month
                            </button>
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm">
                                Year to Date
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-gray-500 text-sm">Total Active Events</span>
                                    <h4 className="text-2xl font-bold text-gray-800 mt-1">243</h4>
                                </div>
                                <div className="p-2 bg-green-100 rounded-md">
                                    <Activity className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                            <div className="flex items-center mt-2">
                                <span className="text-green-600 text-sm font-medium">+12.5%</span>
                                <span className="text-gray-500 text-sm ml-2">from last month</span>
                            </div>
                        </div>

                        <div className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-gray-500 text-sm">Highest Activity</span>
                                    <h4 className="text-2xl font-bold text-gray-800 mt-1">Wildfires</h4>
                                </div>
                                <div className="p-2 bg-red-100 rounded-md">
                                    <Flame className="h-6 w-6 text-red-600" />
                                </div>
                            </div>
                            <div className="flex items-center mt-2">
                                <span className="text-red-600 text-sm font-medium">+28.7%</span>
                                <span className="text-gray-500 text-sm ml-2">increase in incidents</span>
                            </div>
                        </div>

                        <div className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-gray-500 text-sm">Most Affected Region</span>
                                    <h4 className="text-2xl font-bold text-gray-800 mt-1">Asia Pacific</h4>
                                </div>
                                <div className="p-2 bg-blue-100 rounded-md">
                                    <Globe className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                            <div className="flex items-center mt-2">
                                <span className="text-blue-600 text-sm font-medium">118 events</span>
                                <span className="text-gray-500 text-sm ml-2">in the past month</span>
                            </div>
                        </div>

                        <div className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-gray-500 text-sm">Alert Response Time</span>
                                    <h4 className="text-2xl font-bold text-gray-800 mt-1">5.3 min</h4>
                                </div>
                                <div className="p-2 bg-purple-100 rounded-md">
                                    <Zap className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                            <div className="flex items-center mt-2">
                                <span className="text-green-600 text-sm font-medium">-1.2 min</span>
                                <span className="text-gray-500 text-sm ml-2">improvement</span>
                            </div>
                        </div>
                    </div>

                    {/* Chart placeholder - would be implemented with real charting library */}
                    <div className="mt-8 bg-gray-50 p-6 rounded-lg h-64 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <BarChart2 className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                            <p>Interactive disaster trend chart would be rendered here</p>
                            <p className="text-sm mt-2">Using historical data and real-time analysis</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Safety Resources */}
            <section className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-semibold text-gray-800 flex items-center">
                        <Shield className="w-6 w-6 mr-2 text-green-600" />
                        Safety Resources & Guides
                    </h3>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                        View All Resources
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
                        <div className="bg-red-100 p-3 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                            <Flame className="w-6 w-6 text-red-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Wildfire Safety Guide</h4>
                        <p className="text-gray-600 mb-4">Learn essential survival tactics and evacuation procedures during wildfire emergencies.</p>
                        <button className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center">
                            Read Safety Guide
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
                        <div className="bg-blue-100 p-3 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                            <Waves className="w-6 w-6 text-blue-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Flood Preparedness</h4>
                        <p className="text-gray-600 mb-4">Comprehensive guide to prepare your home and family for potential flooding situations.</p>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                            Read Safety Guide
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
                        <div className="bg-yellow-100 p-3 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                            <Activity className="w-6 w-6 text-yellow-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Earthquake Safety</h4>
                        <p className="text-gray-600 mb-4">Vital information on what to do before, during, and after an earthquake strikes.</p>
                        <button className="text-yellow-600 hover:text-yellow-700 text-sm font-medium flex items-center">
                            Read Safety Guide
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center mb-4">
                                <Globe className="h-8 w-8 text-blue-400 mr-2" />
                                <h2 className="text-xl font-bold">Geo Alert</h2>

                            </div>
                            <p className="text-gray-400 mb-4">
                                Global disaster monitoring and alert system providing real-time updates on natural disasters worldwide.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-400 hover:text-white transition">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition">
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white transition">Dashboard</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition">Report Incident</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition">Global Alerts</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition">Resources</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition">Analytics</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Resources</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white transition">Disaster Preparedness</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition">Emergency Contacts</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition">Training Materials</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition">API Documentation</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition">Community Support</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Subscribe to Alerts</h3>
                            <p className="text-gray-400 mb-4">Get emergency alerts and disaster notifications straight to your inbox.</p>
                            <form className="flex">
                                <input
                                    type="email"
                                    placeholder="Your email"
                                    className="px-4 py-2 w-full rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                />
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-md transition"
                                >
                                    Subscribe
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400">© 2025 Geo Alert. All rights reserved.</p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a href="#" className="text-gray-400 hover:text-white transition">Privacy Policy</a>
                            <a href="#" className="text-gray-400 hover:text-white transition">Terms of Service</a>
                            <a href="#" className="text-gray-400 hover:text-white transition">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </footer>

            <ToastContainer
                position="bottom-right"
                theme="dark"
                toastStyle={{ backgroundColor: "#1b1b1b", color: "#0f0", border: "1px solid #0f0" }}
                progressStyle={{ background: "#0f0" }}
            />
        </div>
    );
};

export default HomePage;