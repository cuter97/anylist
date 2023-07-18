import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
            const newUser = this.usersRepository.create(signupInput);
            return await this.usersRepository.save(newUser);
        } catch (error) {
            this.handleDBError(error)
        }
    }

    async findAll(): Promise<User[]> {
        return [];
    }

    findOne(id: string): Promise<User> {
        throw new Error('findOne not implemented');
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
