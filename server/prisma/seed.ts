import 'dotenv/config';
import { PrismaClient, PreferenceType } from '../generated/prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL },
  },
});

const goals = [
  { code: 'PRACTICE_LANGUAGES', label: 'Practice languages' },
  { code: 'FIND_FRIENDS', label: 'Find friends' },
  { code: 'MEET_INTERNATIONAL_PEOPLE', label: 'Meet international people' },
  { code: 'LEARN_SOMETHING_NEW', label: 'Learn something new' },
  { code: 'EXPAND_SOCIAL_CIRCLES', label: 'Expand social circles' },
];

const interests = [
  { code: 'ENGLISH', label: 'English' },
  { code: 'OTHER_LANGUAGES', label: 'Other languages' },
  { code: 'BOARD_GAMES', label: 'Board games' },
  { code: 'TRAVELING', label: 'Traveling' },
  { code: 'SPORTS', label: 'Sports' },
  { code: 'TECHNOLOGY', label: 'Technology' },
  { code: 'CULTURE', label: 'Culture' },
  { code: 'EDUCATION', label: 'Education' },
];

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'tr', name: 'Turkish' },
  { code: 'pl', name: 'Polish' },
  { code: 'nl', name: 'Dutch' },
  { code: 'sv', name: 'Swedish' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'cs', name: 'Czech' },
  { code: 'el', name: 'Greek' },
  { code: 'he', name: 'Hebrew' },
];

const categories = [
  { code: 'SPEAKING_CLUB', name: 'Speaking Club' },
  { code: 'BOARD_GAMES', name: 'International Board Games' },
];

async function main() {
  const preferences = [
    ...goals.map((p) => ({ ...p, type: PreferenceType.GOAL })),
    ...interests.map((p) => ({ ...p, type: PreferenceType.INTEREST })),
  ];

  for (const { type, code, label } of preferences) {
    await prisma.preference.upsert({
      where: { type_code: { type, code } },
      update: { label },
      create: { type, code, label },
    });
  }

  for (const { code, name } of languages) {
    await prisma.language.upsert({
      where: { code },
      update: { name },
      create: { code, name },
    });
  }

  for (const { code, name } of categories) {
    await prisma.eventCategory.upsert({
      where: { code },
      update: { name },
      create: { code, name },
    });
  }

  const [prefCount, langCount, catCount] = await Promise.all([
    prisma.preference.count(),
    prisma.language.count(),
    prisma.eventCategory.count(),
  ]);
  console.log(
    `Seeded: ${prefCount} preferences, ${langCount} languages, ${catCount} event categories`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
