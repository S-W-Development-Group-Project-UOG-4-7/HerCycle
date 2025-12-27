// Add at top of file:
const Experience = require('../models/Experience');

// Update GET route:
router.get('/', async (req, res) => {
    try {
        const experiences = await Experience.find();
        res.json({
            success: true,
            count: experiences.length,
            data: experiences
        });
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: err.message 
        });
    }
});