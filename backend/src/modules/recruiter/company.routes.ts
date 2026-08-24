import { Router } from 'express';
import { companyController } from './company.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.get('/verified', (req, res, next) => companyController.getVerifiedCompanies(req, res, next));
router.get('/:slug', (req, res, next) => companyController.getCompanyBySlug(req, res, next));

router.post('/', authenticate, authorize([Role.RECRUITER, Role.ADMIN]), (req, res, next) =>
  companyController.createCompany(req, res, next)
);

export default router;
