const express = require('express');
const clientController = require('../controllers/clientController');
const { authenticateApiKey } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateApiKey);

// Client routes
router.get('/', clientController.getAllClients);
router.get('/:id', clientController.getClientById);
router.post('/', clientController.createClient);
router.put('/:id', clientController.updateClient);

module.exports = router;
