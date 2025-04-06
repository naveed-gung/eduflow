const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const { authenticate, isAdmin } = require('../middleware/auth');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const { featured } = req.query;
    
    // Build query
    const query = {};
    
    if (featured === 'true') {
      query.featured = true;
    }
    
    const categories = await Category.find(query)
      .sort({ order: 1, name: 1 });
    
    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Get category error:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single category by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ADMIN ROUTES

// Create a new category (admin only)
router.post(
  '/',
  [
    authenticate,
    isAdmin,
    body('name', 'Name is required').not().isEmpty(),
    body('description', 'Description is required').not().isEmpty(),
    body('slug', 'Slug is required').not().isEmpty()
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { name, description, slug, icon, featured, order } = req.body;
    
    try {
      // Check if category with same name or slug already exists
      const existingCategory = await Category.findOne({
        $or: [{ name }, { slug }]
      });
      
      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name or slug already exists' });
      }
      
      // Create new category
      const category = new Category({
        name,
        description,
        slug,
        icon: icon || 'default-category-icon.svg',
        featured: featured || false,
        order: order || 0
      });
      
      await category.save();
      
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        category
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Update a category (admin only)
router.put(
  '/:id',
  [
    authenticate,
    isAdmin
  ],
  async (req, res) => {
    try {
      const category = await Category.findById(req.params.id);
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      const { name, slug } = req.body;
      
      // If name or slug is being changed, check for uniqueness
      if ((name && name !== category.name) || (slug && slug !== category.slug)) {
        const existingCategory = await Category.findOne({
          _id: { $ne: req.params.id },
          $or: [
            { name: name || category.name },
            { slug: slug || category.slug }
          ]
        });
        
        if (existingCategory) {
          return res.status(400).json({ message: 'Category with this name or slug already exists' });
        }
      }
      
      // Update category fields with provided data
      const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      
      res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        category: updatedCategory
      });
    } catch (error) {
      console.error('Update category error:', error);
      
      // Handle invalid ObjectId
      if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Delete a category (admin only)
router.delete('/:id', [authenticate, isAdmin], async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if category has courses
    if (category.coursesCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with courses. Reassign courses first.' 
      });
    }
    
    await Category.deleteOne({ _id: req.params.id });
    
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    
    // Handle invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 