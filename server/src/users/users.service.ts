import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserRole } from './schemas/user.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(
    email: string,
    password: string,
    orgId: string,
    roles: UserRole[] = [UserRole.USER],
  ): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = new this.userModel({
      email,
      passwordHash,
      orgId: new Types.ObjectId(orgId),
      roles,
    });
    return user.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email, isActive: true }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findByOrgId(orgId: string): Promise<User[]> {
    return this.userModel
      .find({ orgId: new Types.ObjectId(orgId), isActive: true })
      .exec();
  }

  async updateRoles(id: string, roles: UserRole[]): Promise<User> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { roles }, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async deactivate(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(id, { isActive: false }).exec();
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }
}
