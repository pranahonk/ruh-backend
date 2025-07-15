const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const { authenticateApiKey } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateApiKey);

// Appointment routes
router.get('/', appointmentController.getAllAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.post('/', appointmentController.createAppointment);
router.put('/:id', appointmentController.updateAppointment);

module.exports = router;
