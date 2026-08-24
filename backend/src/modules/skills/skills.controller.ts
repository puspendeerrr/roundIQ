import { Request, Response, NextFunction } from 'express';
import { skillService } from './skills.service';
import { sendSuccess } from '../../utils/api-response';
import { z } from 'zod';

const createSkillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
});

const updateSkillSchema = z.object({
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export class SkillController {
  async getActiveSkills(_req: Request, res: Response, next: NextFunction) {
    try {
      const skills = await skillService.getActiveSkills();
      return sendSuccess(res, skills, 'Active skills retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async getAllSkills(_req: Request, res: Response, next: NextFunction) {
    try {
      const skills = await skillService.getAllSkills();
      return sendSuccess(res, skills, 'All skills retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async createSkill(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = createSkillSchema.parse(req.body);
      const skill = await skillService.createSkill(name);
      return sendSuccess(res, skill, 'Skill created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async updateSkill(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateSkillSchema.parse(req.body);
      const skill = await skillService.updateSkill(id, data);
      return sendSuccess(res, skill, 'Skill updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  async deleteSkill(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const skill = await skillService.deleteSkill(id);
      return sendSuccess(res, skill, 'Skill deactivated successfully');
    } catch (error) {
      return next(error);
    }
  }
}

export const skillController = new SkillController();
