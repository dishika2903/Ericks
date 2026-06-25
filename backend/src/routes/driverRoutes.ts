import { Router } from 'express';
import { uploadDocuments, updateVehicle, updateStatus, updateLocation, getDriverDetails } from '../controllers/driverController';
import { authenticate, authorizeRoles } from '../middleware/auth';
import { validateFields } from '../middleware/validator';

const router = Router();

// Apply auth and driver role check to all driver endpoints
router.use(authenticate);
router.use(authorizeRoles('driver'));

router.post('/documents', uploadDocuments);
router.post('/vehicle', validateFields(['make', 'model', 'plateNumber']), updateVehicle);
router.post('/status', validateFields(['status']), updateStatus);
router.post('/location', validateFields(['longitude', 'latitude']), updateLocation);
router.get('/details', getDriverDetails);

export default router;
