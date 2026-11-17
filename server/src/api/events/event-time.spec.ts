import { hasEnded } from './event-time';

const now = Date.parse('2030-01-01T12:00:00.000Z');

describe('hasEnded', () => {
  it('is true for COMPLETED regardless of the time', () => {
    expect(
      hasEnded({ status: 'COMPLETED', endsAt: new Date(now + 1000) }, now),
    ).toBe(true);
  });

  it('is true once endsAt has passed, whatever the stored status', () => {
    for (const status of ['DRAFT', 'PUBLISHED'] as const) {
      expect(hasEnded({ status, endsAt: new Date(now) }, now)).toBe(true);
    }
  });

  it('is false for a future end', () => {
    expect(
      hasEnded({ status: 'PUBLISHED', endsAt: new Date(now + 1000) }, now),
    ).toBe(false);
  });
});
