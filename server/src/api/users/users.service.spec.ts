import type { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService.updateProfile', () => {
  const user = {
    id: 'u1',
    name: 'Bob',
    email: 'b@b.co',
    password: 'hash',
    avatarUrl: null,
    dateOfBirth: new Date('2000-01-02'),
    createdAt: new Date('2024-01-01T00:00:00Z'),
  };

  it('returns the public user shape and never the password', async () => {
    const update = jest.fn().mockResolvedValue(user);
    const service = new UsersService({
      user: { update },
    } as unknown as PrismaService);

    const result = await service.updateProfile('u1', { name: 'Bob' });

    expect(update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { name: 'Bob' },
    });
    expect(result).toEqual({
      id: 'u1',
      name: 'Bob',
      email: 'b@b.co',
      avatarUrl: null,
      dateOfBirth: '2000-01-02',
      createdAt: '2024-01-01T00:00:00.000Z',
    });
    expect(result).not.toHaveProperty('password');
  });

  it('passes null through so the avatar can be removed', async () => {
    const update = jest.fn().mockResolvedValue(user);
    const service = new UsersService({
      user: { update },
    } as unknown as PrismaService);
    await service.updateProfile('u1', { avatarUrl: null });
    expect(update).toHaveBeenCalledWith({
      where: { id: 'u1' },
      data: { avatarUrl: null },
    });
  });
});
