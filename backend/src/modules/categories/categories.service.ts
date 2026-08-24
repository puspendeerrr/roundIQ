import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';

export class CategoryService {
  async getActiveCategories() {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getAllCategories() {
    return prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCategory(name: string, description?: string) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new AppError('Category with this name already exists', 409, 'CATEGORY_EXISTS');
    }

    return prisma.category.create({
      data: { name, slug, description },
    });
  }

  async updateCategory(id: string, data: { name?: string; description?: string; isActive?: boolean }) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    let slug = category.slug;
    if (data.name && data.name !== category.name) {
      slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    return prisma.category.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name, slug }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  async deleteCategory(id: string) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    return prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const categoryService = new CategoryService();
