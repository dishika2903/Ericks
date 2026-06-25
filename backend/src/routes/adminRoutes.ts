import { Router } from 'express';
import {
  getPendingDrivers,
  verifyDriver,
  getAnalytics,
  getComplaints,
  resolveComplaint,
  getSOSAlerts,
  resolveSOSAlert
} from '../controllers/adminController';
import { authenticate, authorizeRoles } from '../middleware/auth';
import { validateFields } from '../middleware/validator';

const router = Router();

// Apply auth and admin check to all admin routes
router.use(authenticate);
router.use(authorizeRoles('admin'));

router.get('/drivers/pending', getPendingDrivers);
router.post('/drivers/:id/verify', validateFields(['status']), verifyDriver);
router.get('/analytics', getAnalytics);
router.get('/complaints', getComplaints);
router.post('/complaints/:id/resolve', validateFields(['resolutionDetails']), resolveComplaint);
router.get('/sos', getSOSAlerts);
router.post('/sos/:id/resolve', validateFields(['resolutionNotes']), resolveSOSAlert);

export default router;
