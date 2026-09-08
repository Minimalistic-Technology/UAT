import { Request, Response } from 'express';
import RouteConfig from '../models/RouteConfig';
import { getCache, setCache, delCache, CACHE_KEYS, CACHE_TTL } from '../utils/cache';

// Invalidate the dynamic-routes cache after any mutation
export const clearRoutesCache = () => delCache(CACHE_KEYS.ROUTES);

// @route   GET /api/routes
// @desc    Get all routes (Public/All users to verify access)
export const getRoutes = async (req: Request, res: Response) => {
    try {
        const cached = await getCache(CACHE_KEYS.ROUTES);
        if (cached) return res.json(cached);

        const routes = await RouteConfig.find().sort({ name: 1 });
        await setCache(CACHE_KEYS.ROUTES, routes, CACHE_TTL.ROUTES);
        res.json(routes);
    } catch (err) {
        console.error('Error fetching routes:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// @route   POST /api/routes
// @desc    Add a new route (Admin only)
export const createRoute = async (req: Request, res: Response) => {
    try {
        const { path, name, description, isActive } = req.body;

        if (!path || !name) {
            return res.status(400).json({ msg: 'Path and Name are required' });
        }

        let route = await RouteConfig.findOne({ path });
        if (route) {
            return res.status(400).json({ msg: 'Route with this path already exists' });
        }

        route = new RouteConfig({
            path,
            name,
            description,
            isActive: isActive !== undefined ? isActive : true
        });

        await route.save();
        await clearRoutesCache();
        res.status(201).json(route);
    } catch (err) {
        console.error('Error creating route:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// @route   PUT /api/routes/:id
// @desc    Update a route (Admin only)
export const updateRoute = async (req: Request, res: Response) => {
    try {
        const { path, name, description, isActive } = req.body;
        const routeId = req.params.id;

        const route = await RouteConfig.findById(routeId);
        if (!route) {
            return res.status(404).json({ msg: 'Route not found' });
        }

        if (path) route.path = path;
        if (name) route.name = name;
        if (description !== undefined) route.description = description;
        if (isActive !== undefined) route.isActive = isActive;

        await route.save();
        await clearRoutesCache();
        res.json(route);
    } catch (err) {
        console.error('Error updating route:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// @route   DELETE /api/routes/:id
// @desc    Delete a route (Admin only)
export const deleteRoute = async (req: Request, res: Response) => {
    try {
        const routeId = req.params.id;
        const route = await RouteConfig.findByIdAndDelete(routeId);

        if (!route) {
            return res.status(404).json({ msg: 'Route not found' });
        }

        await clearRoutesCache();
        res.json({ msg: 'Route deleted successfully' });
    } catch (err) {
        console.error('Error deleting route:', err);
        res.status(500).json({ msg: 'Server error' });
    }
};
