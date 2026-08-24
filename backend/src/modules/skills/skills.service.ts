import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';

export class SkillService {
  async getActiveSkills() {
    return prisma.skill.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async getAllSkills() {
    return prisma.skill.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSkill(name: string) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await prisma.skill.findUnique({ where: { slug } });
    if (existing) {
      throw new AppError('Skill with this name already exists', 409, 'SKILL_EXISTS');
    }

    return prisma.skill.create({
      data: { name, slug },
    });
  }

  async updateSkill(id: string, data: { name?: string; isActive?: boolean }) {
    const skill = await prisma.skill.findUnique({ where: { id } });
    if (!skill) {
      throw new AppError('Skill not found', 404, 'SKILL_NOT_FOUND');
    }

    let slug = skill.slug;
    if (data.name && data.name !== skill.name) {
      slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    return prisma.skill.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name, slug }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
  }

  async deleteSkill(id: string) {
    const skill = await prisma.skill.findUnique({ where: { id } });
    if (!skill) {
      throw new AppError('Skill not found', 404, 'SKILL_NOT_FOUND');
    }

    return prisma.skill.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export const skillService = new SkillService();
