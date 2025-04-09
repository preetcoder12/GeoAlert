import { Switch } from '@headlessui/react';
import { useEffect } from 'react';
import axios from 'axios';
import React, { useState, useRef, useMemo, useCallback } from 'react';
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
    Share2,
    Moon,
    Sun,
    AlertCircle,
    Clock,
    BarChart,
    PieChart,
    Settings
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { ToastContainer, toast } from 'react-toastify';
import { useMap } from 'react-leaflet';
import { useNavigate } from "react-router-dom";
import MarkerClusterGroup from 'react-leaflet-cluster';
import { CiLogout } from "react-icons/ci";
import { FaLocationDot } from "react-icons/fa6";
import Footer from './Footer';
import DisasterList from './DisasterCard';

const ProximityAlerts = ({ userLocation, liveEvents }) => {
    const [nearbyDisasters, setNearbyDisasters] = useState([]);

    const haversineDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLng = (lng2 - lng1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    useEffect(() => {
        if (!userLocation || !liveEvents.length) return;

        const nearby = liveEvents.filter(event => {
            const coords = event.geometries?.[0]?.coordinates;
            if (!coords) return false;

            const distance = haversineDistance(
                userLocation.lat,
                userLocation.lng,
                coords[1],
                coords[0]
            );
            return distance <= 50;
        });

        setNearbyDisasters(nearby);
    }, [userLocation, liveEvents]);

    if (!nearbyDisasters.length) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-xs">
            <h3 className="font-bold text-red-600 dark:text-red-400 flex items-center">
                <AlertCircle className="mr-2" /> Nearby Alerts
            </h3>
            <div className="mt-2 space-y-2">
                {nearbyDisasters.map(disaster => (
                    <div key={disaster.id} className="text-sm p-2 bg-red-50 dark:bg-gray-700 rounded">
                        <p className="font-medium">{disaster.title}</p>
                        <p className="text-xs">{disaster.categories?.[0]?.title}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

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
    const [darkMode, setDarkMode] = useState(false);
    const [latLong, setLatLong] = useState("");

    const mapRef = useRef(null);
    const navigate = useNavigate();

    const [userPhone, setUserPhone] = useState(""); // Store user's phone number
    const [alertCooldown, setAlertCooldown] = useState(false);



    // Dark mode setup and persistence
    useEffect(() => {
        // Check for saved dark mode preference in localStorage
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedDarkMode);

        // Set initial theme based on saved preference or system preference
        if (savedDarkMode || (!savedDarkMode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            setMapTheme('dark'); // Sync map theme with UI dark mode
        } else {
            document.documentElement.classList.remove('dark');
            setMapTheme('light');
        }
    }, []);

    // Toggle dark mode function
    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem('darkMode', newDarkMode);

        if (newDarkMode) {
            document.documentElement.classList.add('dark');
            setMapTheme('dark'); // Sync map theme
        } else {
            document.documentElement.classList.remove('dark');
            setMapTheme('light');
        }
    };

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

            if (response?.data?.events) {
                const eventsWithContinent = response.data.events.map(event => {
                    // If continent is already defined, keep it
                    if (event.continent) return event;

                    // Otherwise, calculate it from coordinates
                    const coords = event.geometries?.[0]?.coordinates;
                    if (Array.isArray(coords) && coords.length === 2) {
                        const [lng, lat] = coords;
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
            console.error("❌ Error fetching events:", error);
            setMockData(); // Fallback
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
                geometries: [{ coordinates: [-122.4194, 37.7749] }], // San Francisco
                link: "#",
                severity: "high",
                date: "2023-06-15T08:30:00Z",
                status: "Ongoing",
                affectedArea: "5000 acres",
                casualties: "None reported",
                sources: ["NASA FIRMS", "CAL FIRE"],
                continent: "north_america"
            },
            {
                id: 2,
                title: "Amazon Rainforest Fire",
                description: "Fire reported in the Amazon rainforest, threatening biodiversity",
                categories: [{ title: "Wildfires" }],
                geometries: [{ coordinates: [-60.025, -3.4653] }], // Brazil
                link: "#",
                severity: "medium",
                date: "2023-07-02T11:00:00Z",
                status: "Contained",
                affectedArea: "12000 hectares",
                casualties: "2 injured",
                sources: ["Brazilian Government", "Greenpeace"],
                continent: "south_america"
            },
            {
                id: 3,
                title: "Floods in Bangladesh",
                description: "Severe flooding displaces thousands",
                categories: [{ title: "Floods" }],
                geometries: [{ coordinates: [90.4125, 23.8103] }], // Dhaka
                link: "#",
                severity: "high",
                date: "2023-08-10T06:00:00Z",
                status: "Emergency Response",
                affectedArea: "30 districts",
                casualties: "15 dead, 100+ injured",
                sources: ["Red Cross", "UN"],
                continent: "asia"
            },
            {
                id: 4,
                title: "Cyclone Freddy",
                description: "Category 4 cyclone makes landfall in Madagascar",
                categories: [{ title: "Cyclone" }],
                geometries: [{ coordinates: [47.5162, -18.7669] }], // Madagascar
                link: "#",
                severity: "very high",
                date: "2023-03-20T02:00:00Z",
                status: "Ongoing",
                affectedArea: "Coastal cities",
                casualties: "20 dead, 200 injured",
                sources: ["Weather Channel", "UNICEF"],
                continent: "africa"
            },
            {
                id: 5,
                title: "Heatwave in Europe",
                description: "Record-breaking heatwave in Southern Europe",
                categories: [{ title: "Extreme Temperatures" }],
                geometries: [{ coordinates: [12.4964, 41.9028] }], // Rome
                link: "#",
                severity: "high",
                date: "2023-07-28T15:00:00Z",
                status: "Alert Issued",
                affectedArea: "Italy, Spain, France",
                casualties: "50+ reported deaths",
                sources: ["European Weather Agency", "WHO"],
                continent: "europe"
            },
            {
                id: 6,
                title: "Australian Bushfire",
                description: "Seasonal bushfires in New South Wales",
                categories: [{ title: "Wildfires" }],
                geometries: [{ coordinates: [150.644, -34.397] }], // NSW
                link: "#",
                severity: "moderate",
                date: "2023-11-05T13:00:00Z",
                status: "Under Control",
                affectedArea: "2000 hectares",
                casualties: "None",
                sources: ["NSW Fire Services"],
                continent: "australia"
            },
            {
                id: 7,
                title: "Earthquake in Turkey",
                description: "6.5 magnitude earthquake rocks Eastern Turkey",
                categories: [{ title: "Earthquake" }],
                geometries: [{ coordinates: [39.9208, 32.8541] }], // Ankara (for example)
                link: "#",
                severity: "very high",
                date: "2023-09-15T10:15:00Z",
                status: "Search & Rescue",
                affectedArea: "Multiple provinces",
                casualties: "150+ dead, 800 injured",
                sources: ["USGS", "Turkish Disaster Agency"],
                continent: "asia"
            }

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
        localStorage.clear();  // Clears all localStorage items
        navigate("/signup");
    };

    const userId = localStorage.getItem("authToken");
    const [address, setAddress] = useState("Loading location...");
    const [userdetail, setUserDetail] = useState({});



    const fetchUserDetails = useCallback(async () => {
        try {
            const response = await axios.get(`http://localhost:8000/user/details/${userId}`);
            console.log("Full API Response:", response.data);
            console.log("Raw API response:", response.data);
            console.log("Extracted user:", response.data.user);
            console.log("Extracted location:", response.data.user?.location);

            const user = response.data.user; // Adjust if necessary

            if (!user || typeof user !== 'object') {
                throw new Error("User object not found in response");
            }
            setUserPhone(user.phone || ""); // Add this line
            const {
                location = { lat: 0, lng: 0 },
                ...restUserData
            } = user;

            if (typeof location !== 'object' || !('lat' in location) || !('lng' in location)) {
                console.error("Invalid location format:", location);
                throw new Error("Location data malformed");
            }

            setUserDetail({ ...restUserData, location });
            setLatLong({ lat: location.lat, lng: location.lng });

            console.log("Verified location:", location.lat, location.lng);

            try {
                const geoResponse = await axios.get(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}`
                );
                setAddress(geoResponse.data.display_name || "Address unavailable");
            } catch (geoError) {
                console.warn("Geocoding failed:", geoError);
                setAddress(`Near ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
            }

        } catch (error) {
            console.error("Error in fetchUserDetails:", error);
            setAddress("Error loading location");
            setLatLong({ lat: 0, lng: 0 }); // fallback
        }
    }, [userId]);
    // console.log("user phone  is : ",userPhone)

    useEffect(() => {
        fetchUserDetails();  // This will call the function
    }, [userId]);  // Add dependencies if necessary (e.g., when userId changes)


    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const latLongValue = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                    setLatLong(latLongValue);
                    localStorage.setItem("user_coordinates", latLongValue);

                    try {
                        const response = await axios.get(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                        );

                        if (response.data.display_name) {
                            const address = response.data.display_name;
                            setLocation(address);
                            localStorage.setItem("location", address);
                            toast.success("Location saved!");

                            // Now send the location to the backend for updating
                            const userId = localStorage.getItem("authToken");  // Assuming you store the userId in localStorage

                            // Send PUT request to update the location in the database
                            await axios.put(`http://localhost:8000/user/updateLocation/${userId}`, {
                                location: {
                                    lat: latitude,
                                    lng: longitude,
                                },
                            });

                            toast.success("Location updated. Please refresh!!");

                            // Refresh the page right after the success message
                            window.location.reload(); // Refresh the page immediately after the location is updated
                        } else {
                            setLocation("Location Not Found");
                        }
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


    useEffect(() => {
        const storedLocation = localStorage.getItem("location");
        const storedCoords = localStorage.getItem("user_coordinates");

        if (storedLocation) setLocation(storedLocation);
        if (storedCoords) setLatLong(storedCoords);
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
                return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600';
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
                    <Popup className="event-details-popup dark:bg-gray-800 dark:text-white">
                        <div className="max-w-xs">
                            <div className="flex items-center mb-2">
                                {getDisasterIcon(categoryTitle)}
                                <h3 className="font-bold text-lg ml-2">{disaster.title || "Untitled Event"}</h3>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mb-2 text-sm">{disaster.description || "No description available"}</p>
                            <div className="flex justify-between items-center">
                                <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(disaster.severity || 'unknown')}`}>
                                    {disaster.severity || "unknown"}
                                </span>
                                <button
                                    className="text-blue-600 dark:text-blue-400 text-xs hover:underline"
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

    // Here's the JSX to add a dark mode toggle button
    // This should be added to your header or navbar section
    const DarkModeToggle = () => (
        <button
            onClick={toggleDarkMode}
            className="flex items-center justify-center p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle dark mode"
        >
            {darkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
                <Moon className="h-5 w-5 text-gray-700" />
            )}
        </button>
    );

    // Add the following CSS to your global CSS file or styled-components
    // This CSS is crucial for dark mode functionality
    useEffect(() => {
        // Add global dark mode styles to document 
        const style = document.createElement('style');
        style.textContent = `
            /* Base dark mode styles */
            .dark {
                color-scheme: dark;
                --bg-primary: #1a1a1a;
                --text-primary: #f3f4f6;
                --border-color: #374151;
            }
            
            .dark body {
                background-color: var(--bg-primary);
                color: var(--text-primary);
            }
            
            .dark .leaflet-popup-content-wrapper {
                background-color: #1f2937;
                color: #f3f4f6;
            }
            
            .dark .leaflet-popup-tip {
                background-color: #1f2937;
            }
            
            /* Dark mode for UI elements */
            .dark-card {
                @apply bg-gray-800 text-white border-gray-700;
            }
            
            .dark-input {
                @apply bg-gray-700 border-gray-600 text-white placeholder-gray-400;
            }
            
            .dark-button {
                @apply bg-blue-600 hover:bg-blue-700 text-white;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);


    // Haversine distance calculation
    const haversineDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371; // Earth's radius in kilometers
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLng = (lng2 - lng1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in kilometers
    };

    const sendDisasterAlertSMS = async (disaster) => {
        if (!userPhone) {
            toast.warning("Please set your phone number in profile to receive alerts");
            return;
        }

        try {
            const response = await axios.post('http://localhost:8000/api/send-alert', {
                phone: `+${userPhone.replace(/\D/g, '')}`,
                message: `ALERT: ${disaster.title} (${disaster.categories?.[0]?.title || 'Disaster'}) detected within 500km of your location. Stay safe!`,
                coordinates: disaster.geometries?.[0]?.coordinates
            });

            if (response.data.success) {
                toast.success("Disaster alert sent to your phone!");
            } else {
                toast.error("Failed to send alert: " + (response.data.error || "Unknown error"));
            }
        } catch (error) {
            console.error("Error sending alert:", error);
            toast.error(error.response?.data?.error || "Failed to send alert notification");
        }
    };

    // Updated proximity check effect
    useEffect(() => {
        const checkProximity = async () => {
            if (!userLocation || !liveEvents.length) {
                console.log("Skipping proximity check - missing location or events");
                return;
            }

            console.log("Running proximity check...");
            console.log("User location:", userLocation);
            console.log("Live events count:", liveEvents.length);

            for (const event of liveEvents) {
                const coords = event.geometries?.[0]?.coordinates;
                if (!coords || coords.length !== 2) continue;

                try {
                    const distance = haversineDistance(
                        userLocation.lat,
                        userLocation.lng,
                        coords[1], // latitude
                        coords[0]  // longitude
                    );

                    console.log(`Distance to ${event.title}: ${distance.toFixed(2)}km`);

                    if (distance <= 500) {  // Updated to 500 km
                        console.log("Within danger zone - sending alert");
                        await sendDisasterAlertSMS(event);
                        break;  // Sends alert for the first event within 500 km
                    }
                } catch (error) {
                    console.error("Error calculating distance:", error);
                }
            }
        };

        // Initial check
        checkProximity();

        // Periodic checks every 15 minutes (900000 milliseconds)
        const interval = setInterval(checkProximity, 900000);

        return () => clearInterval(interval);
    }, [userLocation, liveEvents, userPhone]);  // Dependency on liveEvents, userLocation, and userPhone


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            {/* Enhanced Header */}
            <button
                onClick={() => sendDisasterAlertSMS({
                    title: "TEST DISASTER",
                    categories: [{ title: "Earthquake" }],
                    geometries: [{
                        coordinates: [
                            userLocation.lng + 0.1,  // ~11km east
                            userLocation.lat + 0.1   // ~11km north
                        ]
                    }]
                })}
                className="bg-blue-500 text-white p-2 rounded"
            >
                Test Alert (50km)
            </button>
            <header className="bg-gradient-to-r from-gray-900/95 to-red-900/95 shadow-lg border-b border-indigo-500/40">
                <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-5">
                    {/* Left: Logo, Title, Live */}
                    <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/10 p-2 rounded-lg shadow-lg backdrop-blur-sm">
                                <Globe className="h-8 w-8 text-green-400 drop-shadow-md animate-pulse" />
                            </div>
                            <h1 className="text-3xl font-bold text-white tracking-wide drop-shadow-md">
                                Geo<span className="text-green-400 font-extrabold">Alert</span>
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md">
                                <div className="w-2 h-2 bg-white rounded-full animate-ping mr-1"></div>
                                LIVE
                            </div>

                            <div className="text-white text-sm font-medium bg-black/30 px-4 py-1.5 rounded-full shadow-inner backdrop-blur-sm">
                                🕒 {new Date(time).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Middle: Location Info */}
                    <div className="text-white text-sm md:text-right flex-1 bg-white/5 rounded-xl px-5 py-3 backdrop-blur-sm shadow-inner border border-white/10">
                        {/* Address */}
                        <div className="mb-3 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-green-400" />
                            <span className="font-medium">Location:</span>
                            <span className="text-gray-200 italic">
                                {address || "Fetching address..."}
                            </span>
                        </div>

                        {/* Coordinates */}
                        <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-green-400" />
                            <span className="font-medium">Coordinates:</span>
                            <span className="text-gray-200 italic">
                                {userdetail?.location?.lat && userdetail?.location?.lng
                                    ? `${latLong?.lat?.toFixed(4)}, ${latLong?.lng?.toFixed(4)}`
                                    : "Fetching coordinates..."}
                            </span>
                        </div>
                    </div>

                    {/* Right: Logout */}
                    <button
                        onClick={handleLogout}
                        className="px-5 py-2.5 bg-gradient-to-r from-gray-700 to-gray-900 text-white rounded-lg shadow-lg font-semibold text-sm
              hover:from-red-600 hover:to-orange-600 transition-all duration-300 ease-in-out 
              active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 focus:ring-offset-blue-900 flex items-center gap-2"
                    >
                        <CiLogout className="text-white text-lg" />
                        <span>Logout</span>
                    </button>
                </div>
            </header>

            {/* Enhanced Hero Section */}
            <section className="relative bg-cover bg-center py-24" style={{ backgroundImage: "url('/images/world-map-bg.jpg')" }}>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-red-900/85"></div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl backdrop-blur-md bg-black/40 p-8 rounded-3xl shadow-2xl border border-white/10">
                        <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white leading-tight">
                            Global Disaster <span className="text-green-400">Monitoring & Alert System</span>
                        </h2>
                        <p className="text-xl mb-8 text-gray-100 font-light">
                            Track global disasters in real-time, receive instant alerts, and stay prepared with our advanced monitoring and customized region-based notifications. 🌍
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white px-7 py-3.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 shadow-lg shadow-indigo-500/40 active:scale-95">
                                <Bell className="h-5 w-5" />
                                Enable Global Alerts
                            </button>
                            <button className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-7 py-3.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-3 shadow-lg shadow-red-500/40 active:scale-95">
                                <Globe className="h-5 w-5" />
                                <a href='/report' className="text-white">Report Emergency</a>
                            </button>
                            <button
                                onClick={getLocation}
                                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/30 text-white px-7 py-3.5 rounded-xl font-medium 
          hover:bg-white/20 transition-all duration-300 ease-in-out shadow-lg
          active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50"
                            >
                                <FaLocationDot className="text-lg" />
                                <span>Set Your Location</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>


            {/* Map Controls - Enhanced */}
            <div className="container mx-auto px-6 -mt-8 ">
                <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 border border-gray-100 ">
                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <div className="flex flex-wrap gap-4 ">
                            <div className="flex items-center bg-blue-50 rounded-lg px-4 py-2 border border-blue-100 ">
                                <Filter className="h-5 w-5 text-blue-700 mr-2 " />
                                <span className="text-blue-800 font-medium">Filters:</span>
                            </div>

                            <div className="relative">
                                <select
                                    value={continent}
                                    onChange={(e) => setContinent(e.target.value)}
                                    className="appearance-none bg-gray-50 border border-gray-200 text-gray-800 py-2.5 px-5 pr-10 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
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
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-700">
                                    <ChevronDown className="h-4 w-4" />
                                </div>
                            </div>

                            <div className="relative">
                                <select
                                    value={disasterType}
                                    onChange={(e) => setDisasterType(e.target.value)}
                                    className="appearance-none bg-gray-50 border border-gray-200 text-gray-800 py-2.5 px-5 pr-10 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                >
                                    <option value="all">All Disaster Types</option>
                                    {categories.map((category, index) => (
                                        <option key={index} value={category.title.toLowerCase()}>
                                            {category.title}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-700">
                                    <ChevronDown className="h-4 w-4" />
                                </div>
                            </div>

                            <div className="relative">
                                <select
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value)}
                                    className="appearance-none bg-gray-50 border border-gray-200 text-gray-800 py-2.5 px-5 pr-10 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                                >
                                    <option value="all">All Time</option>
                                    <option value="24h">Last 24 Hours</option>
                                    <option value="7d">Last 7 Days</option>
                                    <option value="30d">Last 30 Days</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-700">
                                    <ChevronDown className="h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex gap-2">
                                <span className="px-3.5 py-1.5 bg-red-100 text-red-800 rounded-full text-sm flex items-center shadow-sm">
                                    <span className="w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse"></span>
                                    High
                                </span>
                                <span className="px-3.5 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-sm flex items-center shadow-sm">
                                    <span className="w-2 h-2 bg-yellow-600 rounded-full mr-2"></span>
                                    Medium
                                </span>
                                <span className="px-3.5 py-1.5 bg-green-100 text-green-800 rounded-full text-sm flex items-center shadow-sm">
                                    <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                                    Low
                                </span>
                            </div>

                            <button
                                onClick={fetchDataAndExportCSV}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 font-medium transition-all duration-200 hover:shadow-md border border-gray-200"
                            >
                                <Download className="h-4 w-4" />
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
                            <div className="flex space-x-2 ">
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
                                    center={[20, 0]} // Center of the map (you can update this to the user's location later)
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
                                    {userLocation && userLocation.lat && userLocation.lng && (
                                        <CircleMarker
                                            center={[latLong.lat, latLong.lng]}  // Coordinates from userLocation
                                            radius={8}
                                            pathOptions={{
                                                fillColor: 'red', // Blue color for user location
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

                                {/* Disaster Legend */}
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
                                        className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-red-50"
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
                                                    <span className="font-medium">First Reported:</span> {formatDate(selectedEvent.geometries[0].date)}
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
                                                    href={selectedEvent.sources?.[0]?.url}
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

                    {/* Sidebar with Events List - Enhanced */}
                    {!isFullscreen && (
                        <div className="lg:w-1/3">
                            {/* Events List Card - Enhanced */}
                            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 mb-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                                        <div className="bg-red-100 p-2 rounded-lg mr-3">
                                            <AlertCircle className="w-5 h-5 text-red-600" />
                                        </div>
                                        Recent Disasters
                                    </h3>
                                    <div className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full font-medium text-sm">
                                        {filteredDisasters.length} Events
                                    </div>
                                </div>

                                {/* Search Box - Enhanced */}
                                <div className="relative mb-5">
                                    <input
                                        type="text"
                                        placeholder="Search disasters..."
                                        // value={searchTerm}
                                        // onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 pl-12 pr-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    />
                                    <Search className="absolute left-4 top-3.5 text-gray-400 h-5 w-5" />
                                </div>

                                {/* Events List - Enhanced with Virtual Scrolling */}
                                <div className="h-[600px] overflow-y-auto pr-2 styled-scrollbar">
                                    <DisasterList loading={loading} filteredDisasters={filteredDisasters} />
                                </div>
                            </div>

                            {/* Analytics Card - Enhanced */}
                            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 mb-8">
                                <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
                                    <div className="bg-purple-100 p-2 rounded-lg mr-3">
                                        <BarChart className="w-5 h-5 text-purple-600" />
                                    </div>
                                    Disaster Analytics
                                </h3>

                                <div className="space-y-6">
                                    {/* Analytics Cards */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 shadow-sm">
                                            <div className="font-medium text-blue-800 mb-1">Total Events</div>
                                            <div className="text-2xl font-bold text-blue-900">{filteredDisasters.length}</div>
                                        </div>
                                        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200 shadow-sm">
                                            <div className="font-medium text-red-800 mb-1">High Severity</div>
                                            <div className="text-2xl font-bold text-red-900">
                                                {filteredDisasters.filter(d => d.severity === 'high').length}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visualization - Types Distribution */}
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <h4 className="font-medium text-gray-700 mb-3 text-sm">Disaster Types Distribution</h4>
                                        <div className="h-40">
                                            {/* Replace with actual chart component */}
                                            <div className="h-full flex items-center justify-center text-gray-500">
                                                <PieChart className="w-6 h-6 mr-2" />
                                                Chart would render here
                                            </div>
                                        </div>
                                    </div>

                                    {/* Recent Activity Timeline */}
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                        <h4 className="font-medium text-gray-700 mb-3 text-sm">Recent Activity</h4>
                                        <div className="space-y-3">
                                            {[1, 2, 3].map((_, index) => (
                                                <div key={index} className="flex items-start">
                                                    <div className="flex-shrink-0 h-4 w-4 rounded-full bg-blue-500 mt-1.5 mr-3 relative">
                                                        {index === 0 && (
                                                            <span className="absolute w-2.5 h-2.5 bg-blue-400 rounded-full -top-0.5 -right-0.5 animate-ping"></span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-gray-800 font-medium">
                                                            {['New disaster reported', 'Severity level updated', 'Status changed'][index]}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {['5 minutes ago', '2 hours ago', 'Yesterday'][index]}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Alert Preferences Card - Enhanced */}
                            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                                <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
                                    <div className="bg-green-100 p-2 rounded-lg mr-3">
                                        <Bell className="w-5 h-5 text-green-600" />
                                    </div>
                                    Notification Preferences
                                </h3>

                                <div className="space-y-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-800">Global Notifications</p>
                                            <p className="text-sm text-gray-500">Receive alerts for all major disasters</p>
                                        </div>
                                        <Switch
                                            checked={notifications.global}
                                            // onChange={() => handleNotificationToggle('global')}
                                            className={`${notifications.global ? 'bg-blue-600' : 'bg-gray-200'
                                                } relative inline-flex h-6 w-11 items-center rounded-full`}
                                        >
                                            <span
                                                className={`${notifications.global ? 'translate-x-6' : 'translate-x-1'
                                                    } h-4 w-4 transform rounded-full bg-white transition`}
                                            />
                                        </Switch>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-800">Nearby Events Only</p>
                                            <p className="text-sm text-gray-500">Only alerts within 100km of your location</p>
                                        </div>
                                        <Switch
                                            checked={notifications.nearby}
                                            // onChange={() => handleNotificationToggle('nearby')}
                                            className={`${notifications.nearby ? 'bg-blue-600' : 'bg-gray-200'
                                                } relative inline-flex h-6 w-11 items-center rounded-full`}
                                        >
                                            <span
                                                className={`${notifications.nearby ? 'translate-x-6' : 'translate-x-1'
                                                    } h-4 w-4 transform rounded-full bg-white transition`}
                                            />
                                        </Switch>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-800">High Severity Only</p>
                                            <p className="text-sm text-gray-500">Only receive critical alert notifications</p>
                                        </div>
                                        <Switch
                                            checked={notifications.highSeverity}
                                            // onChange={() => handleNotificationToggle('highSeverity')}
                                            className={`${notifications.highSeverity ? 'bg-blue-600' : 'bg-gray-200'
                                                } relative inline-flex h-6 w-11 items-center rounded-full`}
                                        >
                                            <span
                                                className={`${notifications.highSeverity ? 'translate-x-6' : 'translate-x-1'
                                                    } h-4 w-4 transform rounded-full bg-white transition`}
                                            />
                                        </Switch>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3 rounded-xl font-medium transition-all duration-300 shadow-md shadow-blue-500/30 active:scale-98 flex items-center justify-center gap-2"
                                        >
                                            <Settings className="h-5 w-5" />
                                            Customize Alert Settings
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section >

            <Footer />

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
        </div >
    );
};

export default HomePage;
