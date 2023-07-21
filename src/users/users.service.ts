import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { SignupInput } from 'src/auth/dto/inputs/signup.input';

@Injectable()
export class UsersService {

    private logger: Logger = new Logger('UsersService')

    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>
    ) { }

    async create(signupInput: SignupInput): Promise<User> {
        try {
            const newUser = this.usersRepository.create({
                ...signupInput,
                password: bcrypt.hashSync(signupInput.password, 10)
            });
            return await this.usersRepository.save(newUser);
        } catch (error) {
            this.handleDBError(error)
        }
    }

    async findAll(): Promise<User[]> {
        return [];
    }

    async findOneByEmail(email: string): Promise<User> {
        try {
            return await this.usersRepository.findOneByOrFail({ email });
        } catch (error) {
            throw new NotFoundException(`${email} not found`);
        }
    }

    async findOneById(id: string): Promise<User> {
        try {
            return await this.usersRepository.findOneByOrFail({ id });
        } catch (error) {
            throw new NotFoundException(`${id} not found`);
        }
    }

    block(id: string): Promise<User> {
        throw new Error('findOne not implemented');
    }

    private handleDBError(error: any): never {
        if (error.code === '23505') throw new BadRequestException(error.detail.replace('Key', ''));

        this.logger.error(error);

        throw new InternalServerErrorException('check server logs');
    }
}
