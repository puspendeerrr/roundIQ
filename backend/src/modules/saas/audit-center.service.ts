import { prisma } from '../../utils/prisma';

export class AuditCenterService {
  async getAuditLogs(action?: string, entity?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (action) where.action = action;
    if (entity) where.entity = entity;

    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: { select: { id: true, email: true, role: true } },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}

export const auditCenterService = new AuditCenterService();
