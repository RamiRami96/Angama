import {
  deriveClubStatus,
  toClubDto,
  type ClubWithRelations,
} from './clubs.mapper';

describe('deriveClubStatus', () => {
  it('is active while there is room', () =>
    expect(deriveClubStatus('ACTIVE', 1, 2)).toBe('active'));
  it('is full at capacity', () =>
    expect(deriveClubStatus('ACTIVE', 2, 2)).toBe('full'));
  it('cancelled wins over full', () =>
    expect(deriveClubStatus('CANCELLED', 2, 2)).toBe('cancelled'));
});

describe('toClubDto', () => {
  const club = {
    id: 'c1',
    name: 'Chess',
    description: 'd',
    location: 'l',
    maxMembers: 2,
    status: 'ACTIVE',
    startDate: new Date('2030-01-01T10:00:00Z'),
    endDate: null,
    createdAt: new Date('2029-01-01T00:00:00Z'),
    hostId: 'h',
    host: { id: 'h', name: 'Host', avatarUrl: null },
    registrations: [
      { userId: 'a', status: 'APPROVED' },
      { userId: 'b', status: 'PENDING' },
    ],
  } as unknown as ClubWithRelations;

  it('counts only approved members and falls back endDate to startDate', () => {
    const dto = toClubDto(club, 'b');
    expect(dto.currentMemberCount).toBe(1);
    expect(dto.endDate).toBe('2030-01-01T10:00:00.000Z');
    expect(dto.isRegistered).toBe(true); // pending counts as registered
    expect(dto.host).toEqual({ id: 'h', name: 'Host' }); // no avatarUrl key
  });

  it('is not registered for anonymous or other users', () => {
    expect(toClubDto(club).isRegistered).toBe(false);
    expect(toClubDto(club, 'zzz').isRegistered).toBe(false);
  });
});
