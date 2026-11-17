import {
  CONFIRMED_STATUSES,
  toEventDto,
  type EventWithRelations,
} from './events.mapper';

function row(over: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'e1',
    name: 'Chess',
    description: 'd',
    details: { game: 'Chess', experienceLevel: 'BEGINNER' },
    coverImageUrl: null,
    startsAt: new Date('2030-01-01T10:00:00Z'),
    endsAt: new Date('2030-01-01T12:00:00Z'),
    city: 'Berlin',
    address: 'Main St 1',
    maxParticipants: 5,
    price: null,
    status: 'PUBLISHED',
    createdAt: new Date('2029-01-01T00:00:00Z'),
    updatedAt: new Date('2029-01-01T00:00:00Z'),
    categoryId: 'cat',
    languageId: 'lang',
    organizerId: 'o',
    organizer: { id: 'o', name: 'Org', avatarUrl: null },
    category: { id: 'cat', code: 'BOARD_GAMES', name: 'Board games' },
    language: { id: 'lang', code: 'en', name: 'English' },
    participants: [
      { userId: 'a', status: 'APPROVED' },
      { userId: 'b', status: 'REQUESTED' },
      { userId: 'c', status: 'ATTENDED' },
    ],
    ...over,
  } as unknown as EventWithRelations;
}

describe('CONFIRMED_STATUSES', () => {
  it('is APPROVED, ATTENDED and NO_SHOW', () =>
    expect([...CONFIRMED_STATUSES].sort()).toEqual(
      ['APPROVED', 'ATTENDED', 'NO_SHOW'].sort(),
    ));
});

describe('toEventDto', () => {
  it('counts confirmed participants and derives spotsLeft', () => {
    const dto = toEventDto(row());
    expect(dto.participantCount).toBe(2);
    expect(dto.spotsLeft).toBe(3);
  });

  it('never reports negative spotsLeft', () => {
    expect(toEventDto(row({ maxParticipants: 1 })).spotsLeft).toBe(0);
  });

  it('maps price to a number, or null when absent', () => {
    expect(toEventDto(row()).price).toBeNull();
    expect(toEventDto(row({ price: '12.50' })).price).toBe(12.5);
  });

  it('reflects the viewer participation status', () => {
    expect(toEventDto(row(), 'b').myParticipation).toBe('REQUESTED');
    expect(toEventDto(row(), 'a').myParticipation).toBe('APPROVED');
    expect(toEventDto(row(), 'zzz').myParticipation).toBeNull();
    expect(toEventDto(row()).myParticipation).toBeNull();
  });

  it('uses the fallback status for a viewer outside the included rows', () => {
    expect(toEventDto(row(), 'zzz', 'CANCELLED').myParticipation).toBe(
      'CANCELLED',
    );
  });

  it('returns the public shape', () => {
    const dto = toEventDto(row());
    expect(dto).toMatchObject({
      id: 'e1',
      category: { code: 'BOARD_GAMES', name: 'Board games' },
      language: { code: 'en', name: 'English' },
      details: { game: 'Chess', experienceLevel: 'BEGINNER' },
      coverImageUrl: null,
      startsAt: '2030-01-01T10:00:00.000Z',
      endsAt: '2030-01-01T12:00:00.000Z',
      createdAt: '2029-01-01T00:00:00.000Z',
      status: 'PUBLISHED',
      organizer: { id: 'o', name: 'Org' },
    });
    expect(dto.organizer).not.toHaveProperty('avatarUrl');
    expect(dto).not.toHaveProperty('participants');
  });
});
