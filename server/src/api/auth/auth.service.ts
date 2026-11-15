import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import type { SignUpDto } from './auth.schemas';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async signUp(data: SignUpDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(data.password, 10);
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

    return this.strip(user);
  }

  async signIn(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    return this.strip(user);
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.strip(user) : null;
  }

  async deleteAccount(userId: string) {
    await this.prisma.user.delete({ where: { id: userId } });
  }

  private strip(user: {
    id: string;
    name: string;
    email: string;
    dateOfBirth: Date;
    avatarUrl: string | null;
    createdAt: Date;
    password: string;
  }) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      dateOfBirth: user.dateOfBirth.toISOString().split('T')[0],
      createdAt: user.createdAt.toISOString(),
    };
  }
}
