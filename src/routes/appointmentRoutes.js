const express = require('express');
const appointmentController = require('../controllers/appointmentController');
const { authenticateApiKey } = require('../middleware/auth');

const router = express.Router();


router.use(authenticateApiKey);


router.get('/', appointmentController.getAllAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.post('/', appointmentController.createAppointment);
router.put('/:id', appointmentController.updateAppointment);

module.exports = router;
