import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import type { SignUpDto } from '../../contracts';
import { toPublicUser } from '../../shared/mapper/user.mapper';

const BCRYPT_COST = 10;
// Valid bcrypt hash (same cost) compared against when the email is unknown, so
// sign-in takes the same time whether or not the account exists.
const TIMING_EQUALISER_HASH =
  '$2b$10$R8rnl/y3IXCdtC9lZkwIDOodk/tAoviiMlonRcjDTYywrg.E3MIuu';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signUp(data: SignUpDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(data.password, BCRYPT_COST);
    // A concurrent sign-up with the same email hits the unique index (P2002),
    // which the global filter maps to 409.
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashed,
        dateOfBirth: new Date(data.dateOfBirth),
      },
    });

    return toPublicUser(user);
  }

  async signIn(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    const valid = await bcrypt.compare(
      password,
      user?.password ?? TIMING_EQUALISER_HASH,
    );
    if (!user || !valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return toPublicUser(user);
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? toPublicUser(user) : null;
  }

  async deleteAccount(userId: string) {
    await this.prisma.user.delete({ where: { id: userId } });
  }
}
