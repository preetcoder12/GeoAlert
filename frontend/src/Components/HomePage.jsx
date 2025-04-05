import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON, ZoomControl } from 'react-leaflet';
import {
    Bell,
    TrendingUp,
    MapPin,
    Flame,
    Waves,
    Wind,
    Globe,
    Shield,
    AlertTriangle,
    Activity,
    Download,
    ChevronDown,
    Info,
    Layers,
    Search,
    Zap,
    ThermometerSun,
    Target,
    BarChart2,
    Filter,
    Mail,
    Phone,
    Twitter,
    Facebook,
    Linkedin,
    Github,
    ExternalLink,
    Share2
} from 'lucide-react'; import 'leaflet/dist/leaflet.css';
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
    const [mapView, setMapView] = useState('standard');
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
            const response = await axios.get(`http://localhost:8000/api/events`);
            if (response.data.events) {
                const eventsWithContinent = response.data.events.map(event => {
                    // If continent is already defined, keep it
                    if (event.continent) return event;

                    // Otherwise calculate from coordinates
                    if (event.geometries?.[0]?.coordinates) {
                        const [lng, lat] = event.geometries[0].coordinates;
                        return {
                            ...event,
                            continent: getContinentFromCoords(lat, lng)
                        };
                    }
                    return event;
                });
                setLiveEvents(eventsWithContinent);
            }
        } catch (error) {
            console.error("Error fetching events:", error);
            setMockData();
        } finally {
            setLoading(false);
        }
    }, []);



    const setMockData = () => {
        const mockEvents = [
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
                continent: "north_america"
            },
            // ... other mock events
        ];

        // Ensure all mock events have continent data
        const eventsWithContinent = mockEvents.map(event => {
            if (!event.continent && event.geometries?.[0]?.coordinates) {
                const [lng, lat] = event.geometries[0].coordinates;
                return {
                    ...event,
                    continent: getContinentFromCoords(lat, lng)
                };
            }
            return event;
        });

        setLiveEvents(eventsWithContinent);
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
                    selectedEvent.geometries[0].coordinates[1], // latitude
                    selectedEvent.geometries[0].coordinates[0]  // longitude
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

    // Add this utility function to your component
    const getContinentFromCoords = (lat, lng) => {
        // North America
        if (lat >= 8 && lat <= 84 && lng >= -168 && lng <= -52) return 'north_america';
        // South America
        if (lat >= -56 && lat <= 15 && lng >= -82 && lng <= -34) return 'south_america';
        // Africa
        if (lat >= -35 && lat <= 37 && lng >= -20 && lng <= 55) return 'africa';
        // Europe
        if (lat >= 35 && lat <= 71 && lng >= -10 && lng <= 60) return 'europe';
        // Asia
        if (lat >= 5 && lat <= 80 && lng >= 60 && lng <= 180) return 'asia';
        // Oceania
        if (lat >= -50 && lat <= 0 && lng >= 110 && lng <= 180) return 'oceania';
        // Antarctica
        if (lat >= -90 && lat <= -50) return 'antarctica';
        return 'unknown';
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
                { id: 1, type: 'wildfire', lat: 28.7041, lng: 77.1025, severity: 'high', location: 'Delhi Outskirts, India', continent: 'asia' },
                { id: 2, type: 'flood', lat: 19.0760, lng: 72.8777, severity: 'medium', location: 'Mumbai Suburbs, India', continent: 'asia' },
                { id: 7, type: 'wildfire', lat: 34.0522, lng: -118.2437, severity: 'medium', location: 'Los Angeles, USA', continent: 'north_america' },
                { id: 10, type: 'flood', lat: 48.8566, lng: 2.3522, severity: 'medium', location: 'Paris, France', continent: 'europe' },
                { id: 12, type: 'drought', lat: -1.2921, lng: 36.8219, severity: 'high', location: 'Nairobi, Kenya', continent: 'africa' },
                { id: 14, type: 'landslide', lat: -22.9068, lng: -43.1729, severity: 'high', location: 'Rio de Janeiro, Brazil', continent: 'south_america' },
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

    useEffect(() => {
        if (liveEvents.length > 0) {
            console.log("Sample events with continents:", liveEvents.slice(0, 5).map(e => ({
                title: e.title,
                continent: e.continent,
                coordinates: e.geometries?.[0]?.coordinates
            })));
        }
    }, [liveEvents]);

    const fetchDataAndExportCSV = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/events");
            console.log("Response status:", response.status);

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            console.log("API Response:", data);

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
        }, 1000);

        return () => clearInterval(interval);
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
        const filtered = liveEvents.filter((event) => {
            const typeMatch = disasterType === 'all' ||
                (event.categories && event.categories.some(cat =>
                    cat.title.toLowerCase() === disasterType.toLowerCase()
                ));

            const continentMatch = continent === 'all' ||
                (event.continent &&
                    event.continent.toLowerCase() === continent.toLowerCase());

            return typeMatch && continentMatch;
        });

        console.log('Filtered disasters:', filtered.length, 'for continent:', continent);
        return filtered;
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
            const coordinates = disaster.geometries?.[0]?.coordinates || [0, 0];
            const categoryTitle = disaster.categories?.[0]?.title || "Unknown";
            const markerStyle = DisasterColor(categoryTitle);
            const severityModifier = getSeverityModifier(disaster.severity || 'medium');

            return (
                <CircleMarker
                    key={disaster.id || Math.random()}
                    center={[coordinates[1] || 0, coordinates[0] || 0]}
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
                                coordinates: coordinates
                            });
                        },
                    }}
                >
                    <Popup className="event-details-popup">
                        <div className="max-w-xs">
                            <div className="flex items-center mb-2">
                                {getDisasterIcon(categoryTitle)}
                                <h3 className="font-bold text-lg ml-2">{disaster.title || "Untitled Event"}</h3>
                            </div>
                            <p className="text-gray-700 mb-2 text-sm">{disaster.description || "No description available"}</p>
                            <div className="flex justify-between items-center">
                                <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(disaster.severity || 'unknown')}`}>
                                    {disaster.severity || "unknown"}
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
                                    <option value="antarctica">Antarctica</option>
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
                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                            <h5 className="font-semibold text-gray-700 mb-3 flex items-center">
                                                <Info className="w-5 h-5 mr-2 text-blue-500" />
                                                Description
                                            </h5>
                                            <p className="text-gray-600">{typeof selectedEvent.description === 'string' ? selectedEvent.description : 'No description available'}</p>
                                        </div>

                                        {/* Location card */}
                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                            <h5 className="font-semibold text-gray-700 mb-3 flex items-center">
                                                <MapPin className="w-5 h-5 mr-2 text-red-500" />
                                                Location Details
                                            </h5>
                                            <div className="space-y-2">
                                                <p className="text-gray-600">
                                                    <span className="font-medium">Coordinates:</span>
                                                    {selectedEvent.geometries?.[0]?.coordinates ?
                                                        `${selectedEvent.geometries[0].coordinates[1]?.toFixed(4) || 'N/A'}, ${selectedEvent.geometries[0].coordinates[0]?.toFixed(4) || 'N/A'}` :
                                                        "Unknown"}
                                                </p>
                                                <p className="text-gray-600">
                                                    <span className="font-medium">Address:</span> {location || "Loading..."}
                                                </p>
                                                <p className="text-gray-600">
                                                    <span className="font-medium">Continent:</span> {selectedEvent.continent ? selectedEvent.continent.replace(/_/g, ' ') : "Unknown"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status card */}
                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                            <h5 className="font-semibold text-gray-700 mb-3 flex items-center">
                                                <Activity className="w-5 h-5 mr-2 text-purple-500" />
                                                Event Status
                                            </h5>
                                            <div className="space-y-2">
                                                <p className="text-gray-600">
                                                    <span className="font-medium">Severity:</span>
                                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getSeverityColor(selectedEvent.severity)}`}>
                                                        {selectedEvent.severity}
                                                    </span>
                                                </p>
                                                <p className="text-gray-600">
                                                    <span className="font-medium">Status:</span> {selectedEvent.status || "Unknown"}
                                                </p>
                                                <p className="text-gray-600">
                                                    <span className="font-medium">First Reported:</span> {formatDate(selectedEvent.date)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Impact card */}
                                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                            <h5 className="font-semibold text-gray-700 mb-3 flex items-center">
                                                <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                                                Impact Assessment
                                            </h5>
                                            <div className="space-y-2">
                                                <p className="text-gray-600">
                                                    <span className="font-medium">Affected Area:</span> {typeof selectedEvent.affectedArea === 'string' ? selectedEvent.affectedArea : "Unknown"}
                                                </p>
                                                <p className="text-gray-600">
                                                    <span className="font-medium">Casualties:</span> {selectedEvent.casualties || "None reported"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sources and actions */}
                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="flex flex-wrap justify-between items-center">
                                            <div className="mb-4 md:mb-0">
                                                <h5 className="font-semibold text-gray-700 mb-2">Data Sources:</h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedEvent.sources?.map((source, index) => (
                                                        <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                                                            {typeof source === 'string' ? source : source.url || source.id || 'Unknown source'}
                                                        </span>
                                                    )) || <span className="text-sm text-gray-500">No source information available</span>}
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <a
                                                    href={selectedEvent.link || "#"}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center"
                                                >
                                                    <ExternalLink className="w-4 h-4 mr-2" />
                                                    Official Report
                                                </a>
                                                <button
                                                    onClick={() => {
                                                        // Implement share functionality
                                                        navigator.clipboard.writeText(window.location.href);
                                                        toast.success("Event link copied to clipboard!");
                                                    }}
                                                    className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition flex items-center"
                                                >
                                                    <Share2 className="w-4 h-4 mr-2" />
                                                    Share
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar with Enhanced UI */}
                    <div className={`${isFullscreen ? 'hidden' : 'lg:w-1/3'} space-y-6`}>
                        {/* Notifications Panel */}
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                                    <Bell className="w-5 h-5 mr-2 text-red-600" />
                                    Recent Alerts
                                </h3>
                                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                    {notifications.length} New
                                </span>
                            </div>

                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                                        onClick={() => {
                                            // Find matching event and set as selected
                                            const matchingEvent = liveEvents.find(
                                                (e) => e.categories[0]?.title.toLowerCase() === notification.type.toLowerCase()
                                            );
                                            if (matchingEvent) setSelectedEvent(matchingEvent);
                                        }}
                                    >
                                        <div className="flex justify-between">
                                            <div className="flex items-start">
                                                <div className="p-2 rounded-lg bg-red-50 mr-3">
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
                                        <div className="flex justify-between items-center mt-3">
                                            <span className="text-xs text-gray-500">{notification.time}</span>
                                            <button className="text-xs text-blue-600 hover:underline">Details</button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full mt-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition">
                                View All Alerts
                            </button>
                        </div>

                        {/* Statistics Panel */}
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                                    <TrendingUp className="w-5 w-5 mr-2 text-green-600" />
                                    Global Statistics
                                </h3>
                                <span className="text-xs text-gray-500">Updated hourly</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-blue-800">Total Events</span>
                                        <Globe className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-blue-900 mt-2">1,248</p>
                                    <p className="text-xs text-blue-700 mt-1">+12% this month</p>
                                </div>

                                <div className="bg-red-50 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-red-800">Active Now</span>
                                        <Flame className="w-4 h-4 text-red-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-red-900 mt-2">{filteredDisasters.length}</p>
                                    <p className="text-xs text-red-700 mt-1">+3 today</p>
                                </div>

                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-purple-800">High Risk</span>
                                        <AlertTriangle className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-purple-900 mt-2">48</p>
                                    <p className="text-xs text-purple-700 mt-1">Most in Asia</p>
                                </div>

                                <div className="bg-green-50 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-green-800">Resolved</span>
                                        <Shield className="w-4 h-4 text-green-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-green-900 mt-2">892</p>
                                    <p className="text-xs text-green-700 mt-1">This year</p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Event Distribution</h4>
                                <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                                    [Chart Placeholder]
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                                Quick Actions
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition flex flex-col items-center">
                                    <Bell className="w-5 h-5 mb-1" />
                                    <span className="text-xs font-medium">Subscribe</span>
                                </button>
                                <button className="p-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition flex flex-col items-center">
                                    <MapPin className="w-5 h-5 mb-1" />
                                    <span className="text-xs font-medium">Safe Zones</span>
                                </button>
                                <button className="p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition flex flex-col items-center">
                                    <Target className="w-5 h-5 mb-1" />
                                    <span className="text-xs font-medium">Track Event</span>
                                </button>
                                <button className="p-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition flex flex-col items-center">
                                    <AlertTriangle className="w-5 h-5 mb-1" />
                                    <span className="text-xs font-medium">Report</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <h4 className="text-lg font-semibold mb-4">GeoAlert</h4>
                            <p className="text-gray-400 text-sm">
                                Advanced disaster monitoring and alert system providing real-time global event tracking and notifications.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Resources</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#" className="hover:text-white transition">Disaster Preparedness</a></li>
                                <li><a href="#" className="hover:text-white transition">Emergency Contacts</a></li>
                                <li><a href="#" className="hover:text-white transition">Evacuation Routes</a></li>
                                <li><a href="#" className="hover:text-white transition">Safety Checklists</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><a href="#" className="hover:text-white transition">Live Map</a></li>
                                <li><a href="#" className="hover:text-white transition">Alert History</a></li>
                                <li><a href="#" className="hover:text-white transition">API Documentation</a></li>
                                <li><a href="#" className="hover:text-white transition">Mobile Apps</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold mb-4">Contact</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li className="flex items-center">
                                    <Mail className="w-4 h-4 mr-2" />
                                    contact@geoalert.org
                                </li>
                                <li className="flex items-center">
                                    <Phone className="w-4 h-4 mr-2" />
                                    +1 (555) 123-4567
                                </li>
                                <li className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    Global Monitoring Center
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-400 text-sm mb-4 md:mb-0">
                            © 2023 GeoAlert. All rights reserved.
                        </p>
                        <div className="flex space-x-6">
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <Github className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </footer>

            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </div>
    );
};

export default HomePage;
