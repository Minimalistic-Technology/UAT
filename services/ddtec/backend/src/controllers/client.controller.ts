import { Request, Response } from 'express';
import Client from '../models/Client';
import ClientProject from '../models/ClientProject';
import Lead from '../models/Lead';

const sendClientError = (res: Response, err: any, fallbackMsg: string) => {
    if (err?.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e: any) => e.message);
        res.status(400).json({ msg: messages[0] || fallbackMsg, errors: messages });
        return;
    }
    if (err?.name === 'CastError') {
        res.status(400).json({ msg: `Invalid value for field "${err.path}"` });
        return;
    }
    console.error(fallbackMsg, err);
    res.status(500).json({ msg: fallbackMsg });
};

// @desc    List clients with optional search, including their project counts
// @route   GET /api/clients
export const getClients = async (req: any, res: Response): Promise<void> => {
    try {
        const { search } = req.query;
        const query: any = {};
        if (search) {
            const re = new RegExp(String(search), 'i');
            query.$or = [{ name: re }, { phone: re }, { email: re }, { company: re }];
        }
        const clients = await Client.find(query).sort({ createdAt: -1 }).lean();
        const clientIds = clients.map(c => c._id);
        const projects = await ClientProject.find({ client: { $in: clientIds } }).lean();

        const projectsByClient = new Map<string, any[]>();
        for (const p of projects) {
            const key = String(p.client);
            if (!projectsByClient.has(key)) projectsByClient.set(key, []);
            projectsByClient.get(key)!.push(p);
        }

        const result = clients.map(c => {
            const clientProjects = projectsByClient.get(String(c._id)) || [];
            return {
                ...c,
                projects: clientProjects,
                projectCount: clientProjects.length,
                ongoingCount: clientProjects.filter(p => p.status === 'ongoing').length,
                completedCount: clientProjects.filter(p => p.status === 'completed').length,
            };
        });

        res.json(result);
    } catch (err: any) {
        console.error('Error fetching clients:', err);
        res.status(500).json({ msg: 'Server error fetching clients' });
    }
};

// @desc    Summary stats for clients and their projects
// @route   GET /api/clients/stats
export const getClientStats = async (req: any, res: Response): Promise<void> => {
    try {
        const totalClients = await Client.countDocuments({});
        const totalProjects = await ClientProject.countDocuments({});
        const ongoing = await ClientProject.countDocuments({ status: 'ongoing' });
        const completed = await ClientProject.countDocuments({ status: 'completed' });

        res.json({ totalClients, totalProjects, ongoing, completed });
    } catch (err: any) {
        console.error('Error fetching client stats:', err);
        res.status(500).json({ msg: 'Server error fetching client stats' });
    }
};

// @desc    Create a client
// @route   POST /api/clients
export const createClient = async (req: any, res: Response): Promise<void> => {
    try {
        const client = new Client({ ...req.body, createdBy: req.user?._id });
        await client.save();
        res.status(201).json(client);
    } catch (err: any) {
        sendClientError(res, err, 'Server error creating client');
    }
};

// @desc    Update a client
// @route   PUT /api/clients/:id
export const updateClient = async (req: Request, res: Response): Promise<void> => {
    try {
        const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!client) {
            res.status(404).json({ msg: 'Client not found' });
            return;
        }
        res.json(client);
    } catch (err: any) {
        sendClientError(res, err, 'Server error updating client');
    }
};

// @desc    Delete a client (and its projects)
// @route   DELETE /api/clients/:id
export const deleteClient = async (req: Request, res: Response): Promise<void> => {
    try {
        const client = await Client.findByIdAndDelete(req.params.id);
        if (!client) {
            res.status(404).json({ msg: 'Client not found' });
            return;
        }
        await ClientProject.deleteMany({ client: client._id });
        await Lead.updateMany({ convertedClient: client._id }, { $set: { convertedClient: null } });
        res.json({ msg: 'Client deleted' });
    } catch (err: any) {
        console.error('Error deleting client:', err);
        res.status(500).json({ msg: 'Server error deleting client' });
    }
};

// @desc    Create a project for a client
// @route   POST /api/clients/:id/projects
export const createClientProject = async (req: any, res: Response): Promise<void> => {
    try {
        const client = await Client.findById(req.params.id);
        if (!client) {
            res.status(404).json({ msg: 'Client not found' });
            return;
        }
        const project = new ClientProject({
            ...req.body,
            client: client._id,
            createdBy: req.user?._id
        });
        await project.save();
        res.status(201).json(project);
    } catch (err: any) {
        sendClientError(res, err, 'Server error creating project');
    }
};

// @desc    Update a client project
// @route   PUT /api/clients/:clientId/projects/:projectId
export const updateClientProject = async (req: Request, res: Response): Promise<void> => {
    try {
        const project = await ClientProject.findOneAndUpdate(
            { _id: req.params.projectId, client: req.params.clientId },
            req.body,
            { new: true, runValidators: true }
        );
        if (!project) {
            res.status(404).json({ msg: 'Project not found' });
            return;
        }
        res.json(project);
    } catch (err: any) {
        sendClientError(res, err, 'Server error updating project');
    }
};

// @desc    Delete a client project
// @route   DELETE /api/clients/:clientId/projects/:projectId
export const deleteClientProject = async (req: Request, res: Response): Promise<void> => {
    try {
        const project = await ClientProject.findOneAndDelete({ _id: req.params.projectId, client: req.params.clientId });
        if (!project) {
            res.status(404).json({ msg: 'Project not found' });
            return;
        }
        res.json({ msg: 'Project deleted' });
    } catch (err: any) {
        console.error('Error deleting project:', err);
        res.status(500).json({ msg: 'Server error deleting project' });
    }
};
