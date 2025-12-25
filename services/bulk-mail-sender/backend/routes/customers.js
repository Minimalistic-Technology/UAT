const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// Get all customers with search and pagination
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 50, search, tags } = req.query;
    let query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim());
      query.tags = { $in: tagArray };
    }

    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Customer.countDocuments(query);

    res.json({
      customers,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ customer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new customer
router.post('/', async (req, res) => {
  try {
    const { name, email, company, tags } = req.body;

    // Check if email already exists
    const existing = await Customer.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const customer = await Customer.create({
      name,
      email,
      company,
      tags: tags || []
    });

    res.status(201).json({ success: true, customer });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const { name, email, company, tags, status } = req.body;
    
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if email is being changed to an existing one
    if (email && email !== customer.email) {
      const existing = await Customer.findOne({ email });
      if (existing) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }

    // Update fields
    if (name) customer.name = name;
    if (email) customer.email = email;
    if (company !== undefined) customer.company = company;
    if (tags) customer.tags = tags;
    if (status) customer.status = status;

    await customer.save();

    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ success: true, message: 'Customer deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk import customers (CSV or JSON)
router.post('/bulk-import', async (req, res) => {
  try {
    const { customers } = req.body;

    if (!Array.isArray(customers)) {
      return res.status(400).json({ error: 'Customers must be an array' });
    }

    const results = {
      success: [],
      failed: []
    };

    for (const customerData of customers) {
      try {
        const customer = await Customer.create(customerData);
        results.success.push(customer);
      } catch (error) {
        results.failed.push({
          data: customerData,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      imported: results.success.length,
      failed: results.failed.length,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all unique tags
router.get('/meta/tags', async (req, res) => {
  try {
    const tags = await Customer.distinct('tags');
    res.json({ tags });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;