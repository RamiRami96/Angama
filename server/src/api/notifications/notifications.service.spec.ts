import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from './notifications.service';

function build(notification: Record<string, jest.Mock>) {
  const service = new NotificationsService({
    notification,
  } as unknown as PrismaService);
  return service;
}

describe('NotificationsService.list', () => {
  it('filters by user, newest first, take 50, and maps the DTO', async () => {
    const createdAt = new Date('2025-01-02T03:04:05Z');
    const findMany = jest.fn().mockResolvedValue([
      {
        id: 'n1',
        type: 'PARTICIPATION_APPROVED',
        eventId: 'e1',
        readAt: null,
        createdAt,
        event: { name: 'Hike' },
        actor: { name: 'Alice' },
      },
      {
        id: 'n2',
        type: 'EVENT_CANCELLED',
        eventId: 'e2',
        readAt: new Date(),
        createdAt,
        event: { name: 'Picnic' },
        actor: null,
      },
    ]);

    const result = await build({ findMany }).list('u1');

    expect(findMany).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        event: { select: { name: true } },
        actor: { select: { name: true } },
      },
    });
    expect(result).toEqual([
      {
        id: 'n1',
        type: 'PARTICIPATION_APPROVED',
        eventId: 'e1',
        eventName: 'Hike',
        actorName: 'Alice',
        read: false,
        createdAt: '2025-01-02T03:04:05.000Z',
      },
      {
        id: 'n2',
        type: 'EVENT_CANCELLED',
        eventId: 'e2',
        eventName: 'Picnic',
        actorName: null,
        read: true,
        createdAt: '2025-01-02T03:04:05.000Z',
      },
    ]);
  });
});

describe('NotificationsService.unreadCount', () => {
  it('counts the user unread notifications', async () => {
    const count = jest.fn().mockResolvedValue(3);

    const result = await build({ count }).unreadCount('u1');

    expect(count).toHaveBeenCalledWith({
      where: { userId: 'u1', readAt: null },
    });
    expect(result).toEqual({ count: 3 });
  });
});

describe('NotificationsService.markRead', () => {
  it('404s without updating when the notification is not the user own', async () => {
    const findFirst = jest.fn().mockResolvedValue(null);
    const updateMany = jest.fn();

    await expect(
      build({ findFirst, updateMany }).markRead('u1', 'n1'),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(findFirst).toHaveBeenCalledWith({
      where: { id: 'n1', userId: 'u1' },
      select: { readAt: true },
    });
    expect(updateMany).not.toHaveBeenCalled();
  });

  it('marks an unread own notification as read', async () => {
    const findFirst = jest.fn().mockResolvedValue({ readAt: null });
    const updateMany = jest.fn().mockResolvedValue({ count: 1 });

    await build({ findFirst, updateMany }).markRead('u1', 'n1');

    expect(updateMany).toHaveBeenCalledWith({
      where: { id: 'n1', userId: 'u1', readAt: null },
      data: { readAt: expect.any(Date) as Date },
    });
  });

  it('is an idempotent success for an already-read notification', async () => {
    const findFirst = jest.fn().mockResolvedValue({ readAt: new Date() });
    const updateMany = jest.fn().mockResolvedValue({ count: 0 });

    await expect(
      build({ findFirst, updateMany }).markRead('u1', 'n1'),
    ).resolves.toBeUndefined();
  });
});

describe('NotificationsService.markAllRead', () => {
  it('updates only the user unread notifications', async () => {
    const updateMany = jest.fn().mockResolvedValue({ count: 2 });

    await build({ updateMany }).markAllRead('u1');

    expect(updateMany).toHaveBeenCalledWith({
      where: { userId: 'u1', readAt: null },
      data: { readAt: expect.any(Date) as Date },
    });
  });
});
