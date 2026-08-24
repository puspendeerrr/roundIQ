import { prisma } from '../../utils/prisma';
import { AppError } from '../../middleware/error-handler';
import { TicketCategory, TicketPriority, TicketStatus } from '@prisma/client';

export interface CreateTicketParams {
  userId: string;
  category: TicketCategory;
  priority: TicketPriority;
  subject: string;
  message: string;
}

export class SupportService {
  private generateTicketNumber(): string {
    const random = Math.floor(100000 + Math.random() * 900000);
    return `TICK-2026-${random}`;
  }

  async createTicket(params: CreateTicketParams) {
    const ticketNumber = this.generateTicketNumber();

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        userId: params.userId,
        category: params.category || TicketCategory.TECHNICAL,
        priority: params.priority || TicketPriority.MEDIUM,
        subject: params.subject,
        status: TicketStatus.OPEN,
        messages: {
          create: {
            senderId: params.userId,
            message: params.message,
          },
        },
      },
      include: {
        messages: true,
      },
    });

    return ticket;
  }

  async addTicketMessage(ticketId: string, senderId: string, message: string, isInternalNote = false) {
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      throw new AppError('Support ticket not found', 404, 'TICKET_NOT_FOUND');
    }

    const msg = await prisma.supportTicketMessage.create({
      data: {
        ticketId,
        senderId,
        message,
        isInternalNote,
      },
    });

    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: isInternalNote ? ticket.status : TicketStatus.WAITING_FOR_USER },
    });

    return msg;
  }

  async getUserTickets(userId: string) {
    return prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { id: true, email: true, role: true } } },
        },
      },
    });
  }

  async getAdminTickets(status?: TicketStatus, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, role: true } },
          assignedTo: { select: { id: true, email: true } },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateTicketStatus(ticketId: string, status: TicketStatus, assignedToId?: string) {
    return prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status,
        ...(assignedToId !== undefined && { assignedToId }),
      },
    });
  }
}

export const supportService = new SupportService();
