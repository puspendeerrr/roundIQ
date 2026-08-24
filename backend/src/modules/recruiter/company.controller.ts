import { Response, NextFunction } from 'express';
import { companyService } from './company.service';
import { sendSuccess } from '../../utils/api-response';
import { AuthRequest } from '../../middleware/auth';

export class CompanyController {
  async createCompany(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const company = await companyService.createCompany(req.body);
      return sendSuccess(res, company, 'Company profile created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async getCompanyBySlug(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const company = await companyService.getCompanyBySlug(slug);
      return sendSuccess(res, company, 'Company profile retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async getVerifiedCompanies(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;
      const result = await companyService.getVerifiedCompanies(
        page ? Number(page) : 1,
        limit ? Number(limit) : 10
      );
      return sendSuccess(res, result.items, 'Verified companies retrieved', 200, result.meta);
    } catch (error) {
      return next(error);
    }
  }

  async adminVerifyCompany(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { verified } = req.body;
      const company = await companyService.adminVerifyCompany(id, Boolean(verified));
      return sendSuccess(res, company, 'Company verification status updated');
    } catch (error) {
      return next(error);
    }
  }
}

export const companyController = new CompanyController();
