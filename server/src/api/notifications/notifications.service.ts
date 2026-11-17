import { Injectable, NotFoundException } from '@nestjs/common';
import type { NotificationType } from '../../../generated/prisma/enums';
import { PrismaService } from '../../prisma/prisma.service';

export interface NotificationDto {
  id: string;
  type: NotificationType;
  eventId: string;
  eventName: string;
  actorName: string | null;
  read: boolean;
  createdAt: string;
}

const LIST_LIMIT = 50;

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string): Promise<NotificationDto[]> {
    const rows = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: LIST_LIMIT,
      include: {
        event: { select: { name: true } },
        actor: { select: { name: true } },
      },
    });

    return rows.map((row) => ({
      id: row.id,
      type: row.type,
      eventId: row.eventId,
      eventName: row.event.name,
      actorName: row.actor?.name ?? null,
      read: row.readAt !== null,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async unreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.prisma.notification.count({
      where: { userId, readAt: null },
    });
    return { count };
  }

  /** Own notifications only; already-read ones are an idempotent success. */
  async markRead(userId: string, id: string): Promise<void> {
    const found = await this.prisma.notification.findFirst({
      where: { id, userId },
      select: { readAt: true },
    });
    if (!found) throw new NotFoundException('Notification not found');
    if (found.readAt !== null) return;

    await this.prisma.notification.updateMany({
      where: { id, userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async markAllRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }
}
