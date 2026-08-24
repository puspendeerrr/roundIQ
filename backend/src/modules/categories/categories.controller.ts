import { Request, Response, NextFunction } from 'express';
import { categoryService } from './categories.service';
import { sendSuccess } from '../../utils/api-response';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export class CategoryController {
  async getActiveCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.getActiveCategories();
      return sendSuccess(res, categories, 'Active categories retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async getAllCategories(_req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.getAllCategories();
      return sendSuccess(res, categories, 'All categories retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = createCategorySchema.parse(req.body);
      const category = await categoryService.createCategory(name, description);
      return sendSuccess(res, category, 'Category created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateCategorySchema.parse(req.body);
      const category = await categoryService.updateCategory(id, data);
      return sendSuccess(res, category, 'Category updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await categoryService.deleteCategory(id);
      return sendSuccess(res, category, 'Category deactivated successfully');
    } catch (error) {
      return next(error);
    }
  }
}

export const categoryController = new CategoryController();
