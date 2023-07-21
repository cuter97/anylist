import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { SignupInput } from 'src/auth/dto/inputs/signup.input';
import { ValidRoles } from 'src/auth/enums/valid-role.enum';

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

    async findAll(roles: ValidRoles[]): Promise<User[]> {
        if (roles.length === 0)
            return this.usersRepository.find({
                // no es necesario porque tenemos lazy la propiedad lastUpdateBy
                // relations: {
                //     lastUpdateBy: true
                // }
            });

        return this.usersRepository.createQueryBuilder()
            .andWhere('ARRAY[roles] && ARRAY[:...roles]')  //see postgres documentation Array Functions and Operators
            .setParameter('roles', roles)
            .getMany()

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

    async block(id: string, adminUser: User): Promise<User> {
        const userToBlock = await this.findOneById(id);

        userToBlock.isActive = false;
        userToBlock.lastUpdateBy = adminUser;

        return await this.usersRepository.save(userToBlock);
    }

    private handleDBError(error: any): never {
        if (error.code === '23505')
            throw new BadRequestException(error.detail.replace('Key', ''));

        this.logger.error(error);

        throw new InternalServerErrorException('check server logs');
    }
}
