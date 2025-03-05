const express = require('express');
const router = express.Router();
const pool = require('../database');

// Recipe Listing
router.get('/', async (req, res) => {
    try {
      const [recipes] = await pool.query(`
        SELECT r.*, GROUP_CONCAT(i.name) AS ingredients 
        FROM recipes r
        LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
        LEFT JOIN ingredients i ON ri.ingredient_id = i.id
        GROUP BY r.id
      `);
  
      const categorized = recipes.reduce((acc, recipe) => {
        const category = recipe.protein_type;
        if (!acc[category]) acc[category] = [];
        acc[category].push(recipe);
        return acc;
      }, {});
  
      res.render('pages/recipes', { 
        categorized,
        title: 'All Recipes'
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
});

// Add Recipe Form
router.get('/add/new', async (req, res) => {
    try {
      const [allIngredients] = await pool.query('SELECT * FROM ingredients');
      // Add title parameter
      res.render('pages/add-recipe', { 
        allIngredients,
        title: 'Add New Recipe'
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
  });

// Handle Form Submission
router.post('/add', async (req, res) => {
  try {
    const { name, protein_type, instructions, ingredients } = req.body;
    
    // Handle case when only one ingredient is selected (comes as string, not array)
    const ingredientIds = Array.isArray(ingredients) ? ingredients : [ingredients];
    
    const [result] = await pool.query(
      'INSERT INTO recipes (name, protein_type, instructions) VALUES (?, ?, ?)',
      [name, protein_type, instructions]
    );
    
    const recipeId = result.insertId;
    
    if (ingredientIds && ingredientIds.length > 0) {
      const insertPromises = ingredientIds.map(ingId => 
        pool.query('INSERT INTO recipe_ingredients (recipe_id, ingredient_id) VALUES (?, ?)', 
                  [recipeId, ingId])
      );
      
      await Promise.all(insertPromises);
    }
    
    res.redirect(`/recipes/${recipeId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Individual Recipe
function sanitizeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/\n/g, '<br>');
  }
  
  router.get('/:id', async (req, res) => {
      try {
        const [[recipe]] = await pool.query('SELECT * FROM recipes WHERE id = ?', [req.params.id]);
        
        if (!recipe) {
          return res.status(404).send('Recipe not found');
        }
        
        // Sanitize the instructions
        recipe.sanitizedInstructions = sanitizeHtml(recipe.instructions);
        
        const [ingredients] = await pool.query(`
          SELECT i.* FROM ingredients i
          JOIN recipe_ingredients ri ON i.id = ri.ingredient_id
          WHERE ri.recipe_id = ?
        `, [req.params.id]);
        
        res.render('pages/recipe', { 
          recipe, 
          ingredients,
          title: recipe.name
        });
      } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
      }
  });
module.exports = router;