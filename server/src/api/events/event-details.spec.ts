import { BadRequestException } from '@nestjs/common';
import type { EventCategoryCode } from '../../contracts';
import { parseEventDetails } from './event-details';

describe('parseEventDetails', () => {
  describe('SPEAKING_CLUB', () => {
    it('accepts a topic with an optional level', () => {
      expect(
        parseEventDetails('SPEAKING_CLUB', { topic: 'Travel', level: 'B1' }),
      ).toEqual({ topic: 'Travel', level: 'B1' });
      expect(parseEventDetails('SPEAKING_CLUB', { topic: 'Travel' })).toEqual({
        topic: 'Travel',
      });
    });

    it('rejects a missing topic or an unknown level', () => {
      expect(() => parseEventDetails('SPEAKING_CLUB', {})).toThrow(
        BadRequestException,
      );
      expect(() =>
        parseEventDetails('SPEAKING_CLUB', { topic: 'x', level: 'Z9' }),
      ).toThrow(BadRequestException);
    });
  });

  describe('BOARD_GAMES', () => {
    it('accepts a game with an experience level', () => {
      expect(
        parseEventDetails('BOARD_GAMES', {
          game: 'Catan',
          experienceLevel: 'BEGINNER',
        }),
      ).toEqual({ game: 'Catan', experienceLevel: 'BEGINNER' });
    });

    it('rejects a missing game or experience level', () => {
      expect(() =>
        parseEventDetails('BOARD_GAMES', { experienceLevel: 'BEGINNER' }),
      ).toThrow(BadRequestException);
      expect(() => parseEventDetails('BOARD_GAMES', { game: 'Catan' })).toThrow(
        BadRequestException,
      );
    });
  });

  it('rejects details that are not an object', () => {
    expect(() => parseEventDetails('BOARD_GAMES', null)).toThrow(
      BadRequestException,
    );
  });

  it('rejects an unknown category', () => {
    expect(() =>
      parseEventDetails('YOGA' as EventCategoryCode, { topic: 'x' }),
    ).toThrow(BadRequestException);
  });
});
