import {
  createEventSchema,
  listEventsQuerySchema,
  signUpSchema,
  updateEventSchema,
  updateLanguagesSchema,
  updatePreferencesSchema,
} from './index';

describe('auth contracts', () => {
  const signUp = {
    name: 'Alice',
    email: 'Alice@Example.com',
    password: 'password123',
    dateOfBirth: '1995-05-12',
  };

  it('rejects sign-up without city', () => {
    expect(signUpSchema.safeParse(signUp).success).toBe(false);
  });

  it('accepts sign-up with city', () => {
    const result = signUpSchema.safeParse({ ...signUp, city: ' Berlin ' });
    expect(result.success).toBe(true);
    expect(result.data?.city).toBe('Berlin');
  });
});

describe('event contracts', () => {
  const base = {
    name: 'Friday meetup',
    description: 'Come and chat',
    coverImageUrl: 'https://example.com/cover.png',
    startsAt: '2026-12-05T18:00:00Z',
    endsAt: '2026-12-05T20:00:00Z',
    city: 'Berlin',
    address: 'Main St 1',
    maxParticipants: 10,
    price: 5,
    language: 'en',
  };
  const speakingClub = {
    ...base,
    category: 'SPEAKING_CLUB',
    details: { topic: 'Travel' },
  };
  const boardGames = {
    ...base,
    category: 'BOARD_GAMES',
    details: { game: 'Catan', experienceLevel: 'BEGINNER' },
  };

  it('accepts a valid speaking club and defaults status to PUBLISHED', () => {
    const result = createEventSchema.safeParse(speakingClub);
    expect(result.success).toBe(true);
    expect(result.data?.status).toBe('PUBLISHED');
  });

  it('rejects a speaking club without topic', () => {
    const result = createEventSchema.safeParse({
      ...speakingClub,
      details: {},
    });
    expect(result.success).toBe(false);
  });

  it('accepts a valid board-games event', () => {
    expect(createEventSchema.safeParse(boardGames).success).toBe(true);
  });

  it('rejects board-games with experienceLevel EXPERT', () => {
    const result = createEventSchema.safeParse({
      ...boardGames,
      details: { game: 'Catan', experienceLevel: 'EXPERT' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects endsAt equal to startsAt', () => {
    const result = createEventSchema.safeParse({
      ...speakingClub,
      endsAt: speakingClub.startsAt,
    });
    expect(result.success).toBe(false);
  });

  it('updateEventSchema strips category and does not default status', () => {
    const result = updateEventSchema.safeParse({
      name: 'Renamed',
      category: 'BOARD_GAMES',
    });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ name: 'Renamed' });
  });

  it('updateEventSchema rejects endsAt before startsAt when both given', () => {
    const result = updateEventSchema.safeParse({
      startsAt: '2026-12-05T20:00:00Z',
      endsAt: '2026-12-05T18:00:00Z',
    });
    expect(result.success).toBe(false);
  });

  it('updateEventSchema keeps details fields of either category', () => {
    const result = updateEventSchema.safeParse({
      details: { game: 'Catan' },
    });
    expect(result.data).toEqual({ details: { game: 'Catan' } });
  });

  it('listEventsQuerySchema rejects a non ISO date', () => {
    expect(
      listEventsQuerySchema.safeParse({ date: '12/05/2026' }).success,
    ).toBe(false);
    expect(
      listEventsQuerySchema.safeParse({ date: '2026-12-05' }).success,
    ).toBe(true);
  });
});

describe('preferences contracts', () => {
  it('rejects goal code SPORTS (it is an interest)', () => {
    const result = updatePreferencesSchema.safeParse({
      goals: ['SPORTS'],
      interests: [],
    });
    expect(result.success).toBe(false);
  });

  it('dedupes preference codes', () => {
    const result = updatePreferencesSchema.safeParse({
      goals: ['FIND_FRIENDS', 'FIND_FRIENDS'],
      interests: ['SPORTS', 'SPORTS'],
    });
    expect(result.data).toEqual({
      goals: ['FIND_FRIENDS'],
      interests: ['SPORTS'],
    });
  });

  it('rejects duplicate language codes', () => {
    const result = updateLanguagesSchema.safeParse({
      languages: [
        { code: 'en', level: 'B2' },
        { code: 'en', level: 'C1' },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects language level D1', () => {
    const result = updateLanguagesSchema.safeParse({
      languages: [{ code: 'en', level: 'D1' }],
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid languages', () => {
    expect(
      updateLanguagesSchema.safeParse({
        languages: [{ code: 'en', level: 'B2' }],
      }).success,
    ).toBe(true);
  });
});
