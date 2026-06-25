import { Router } from 'express';
import { requestDelivery, getDeliveryDetails, verifyDeliveryHandover } from '../controllers/deliveryController';
import { authenticate } from '../middleware/auth';
import { validateFields } from '../middleware/validator';

const router = Router();

router.use(authenticate);

router.post('/request', validateFields([
  'packageType',
  'pickupAddress',
  'pickupCoords',
  'recipientName',
  'recipientPhone',
  'dropoffAddress',
  'dropoffCoords'
]), requestDelivery);

router.get('/:id', getDeliveryDetails);
router.post('/:id/verify-handover', validateFields(['otp']), verifyDeliveryHandover);

export default router;
