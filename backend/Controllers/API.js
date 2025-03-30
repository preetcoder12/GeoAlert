require("dotenv").config();
const axios = require('axios');
const EONET_API_URL = process.env.Api || 'https://eonet.gsfc.nasa.gov/api/v2.1';


// Cache for categories and layers to reduce API calls
let categoryCache = null;
let layerCache = null;
let lastCacheUpdate = null;
const CACHE_TTL = 3600000; // 1 hour in milliseconds

// Helper function to fetch with error handling
const fetchFromEONET = async (endpoint, params = {}) => {
  try {
    const response = await axios.get(`${EONET_API_URL}${endpoint}`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching from EONET: ${endpoint}`, error);
    throw error;
  }
};

// Get all disaster events with filtering options
const getAllEvents = async (req, res) => {
  try {
    // Extract query parameters
    const { source, status, limit, days, category } = req.query;
    
    // Prepare params object
    const params = {};
    if (source) params.source = source;
    if (status) params.status = status;
    if (limit) params.limit = parseInt(limit);
    if (days) params.days = parseInt(days);
    if (category) params.category = category;

    const data = await fetchFromEONET('/events', params);
    
    // Transform the data if needed
    const events = data.events.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      link: event.link,
      categories: event.categories,
      sources: event.sources,
      geometries: event.geometries,
      closed: event.closed,
      isOpen: !event.closed
    }));

    res.json({
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ 
      error: 'Failed to fetch events',
      details: error.message 
    });
  }
};

// Get a specific event by ID with full details
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await fetchFromEONET(`/events/${id}`);
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Add additional processing if needed
    const enhancedEvent = {
      ...event,
      isOpen: !event.closed,
      primaryCategory: event.categories?.[0]?.title || 'Unknown',
      lastUpdated: event.geometries?.slice(-1)[0]?.date || null
    };

    res.json(enhancedEvent);
  } catch (error) {
    console.error(`Error fetching event ${id}:`, error);
    res.status(500).json({ 
      error: `Failed to fetch event ${id}`,
      details: error.message 
    });
  }
};

// Get all categories with caching
const getCategories = async (req, res) => {
  try {
    // Check cache first
    const now = Date.now();
    if (!categoryCache || !lastCacheUpdate || (now - lastCacheUpdate) > CACHE_TTL) {
      const data = await fetchFromEONET('/categories');
      categoryCache = data.categories.map(cat => ({
        id: cat.id,
        title: cat.title,
        description: cat.description,
        link: cat.link,
        layersEndpoint: cat.layers
      }));
      lastCacheUpdate = now;
    }

    res.json({
      count: categoryCache.length,
      categories: categoryCache
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      error: 'Failed to fetch categories',
      details: error.message 
    });
  }
};

// Get a specific category by ID with its events
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const { source, status, limit, days } = req.query;

    // First get category details
    const category = (await fetchFromEONET('/categories')).categories.find(c => c.id == id);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Then get events for this category
    const params = {};
    if (source) params.source = source;
    if (status) params.status = status;
    if (limit) params.limit = parseInt(limit);
    if (days) params.days = parseInt(days);

    const eventsData = await fetchFromEONET(`/categories/${id}`, params);

    res.json({
      category: {
        id: category.id,
        title: category.title,
        description: category.description,
        link: category.link
      },
      events: eventsData.events.map(event => ({
        id: event.id,
        title: event.title,
        isOpen: !event.closed,
        lastUpdated: event.geometries?.slice(-1)[0]?.date || null
      })),
      count: eventsData.events.length
    });
  } catch (error) {
    console.error(`Error fetching category ${id}:`, error);
    res.status(500).json({ 
      error: `Failed to fetch category ${id}`,
      details: error.message 
    });
  }
};

// Get all available map layers with caching
const getLayers = async (req, res) => {
  try {
    const { category } = req.query;

    // Check cache first
    const now = Date.now();
    if (!layerCache || !lastCacheUpdate || (now - lastCacheUpdate) > CACHE_TTL) {
      const data = await fetchFromEONET('/layers');
      layerCache = data.layers.map(layer => ({
        name: layer.name,
        serviceUrl: layer.serviceUrl,
        serviceTypeId: layer.serviceTypeId,
        parameters: layer.parameters,
        categoryId: layer.categoryId
      }));
      lastCacheUpdate = now;
    }

    // Filter by category if specified
    let layers = layerCache;
    if (category) {
      layers = layers.filter(layer => layer.categoryId == category);
    }

    res.json({
      count: layers.length,
      layers
    });
  } catch (error) {
    console.error('Error fetching layers:', error);
    res.status(500).json({ 
      error: 'Failed to fetch layers',
      details: error.message 
    });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  getCategories,
  getCategoryById,
  getLayers
};