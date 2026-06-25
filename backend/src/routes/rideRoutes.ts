import { Router } from 'express';
import { requestRide, getRideDetails, cancelRide, verifyStartRide, verifyCompleteRide } from '../controllers/rideController';
import { authenticate } from '../middleware/auth';
import { validateFields } from '../middleware/validator';

const router = Router();

router.use(authenticate);

router.post('/request', validateFields(['pickup.address', 'pickup.location.coordinates', 'destination.address', 'destination.location.coordinates']), requestRide);
router.get('/:id', getRideDetails);
router.post('/:id/cancel', cancelRide);
router.post('/:id/verify-start', validateFields(['otp']), verifyStartRide);
router.post('/:id/verify-complete', validateFields(['otp']), verifyCompleteRide);

export default router;
