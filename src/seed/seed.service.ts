import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Item } from 'src/items/entities/item.entity';
import { User } from 'src/users/entities/user.entity';

import { UsersService } from 'src/users/users.service';

import { SEED_ITEMS, SEED_USERS } from './data/seed-data';
import { ItemsService } from 'src/items/items.service';

@Injectable()
export class SeedService {

    private isProd: Boolean;

    constructor(
        private readonly configService: ConfigService,

        private readonly usersService: UsersService,

        private readonly itemsService: ItemsService,

        @InjectRepository(Item)
        private readonly itemsRepository: Repository<Item>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

    ) {
        this.isProd = configService.get('STATE') === 'prod';
    }

    async executeSeed() {

        if (this.isProd) throw new UnauthorizedException('We cannot run SEED on Prod');

        await this.deleteDatabase();
        const user = await this.loadUsers();
        await this.loadItems(user);
        
        return true;
    }

    async deleteDatabase() {
        await this.itemsRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute();

        await this.userRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute();
    }

    async loadUsers(): Promise<User> {
        const users = [];
        for (const user of SEED_USERS) {
            users.push(await this.usersService.create(user));
        }
        return users[0];
    }

    async loadItems(user: User): Promise<void> {
        const itemsPromises = [];
        for (const item of SEED_ITEMS) {
            itemsPromises.push(await this.itemsService.create(item, user));
        }
        await Promise.all(itemsPromises);
    }

}