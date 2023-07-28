import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Item } from 'src/items/entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import { ListItem } from 'src/list-item/entities/list-item.entity';
import { List } from 'src/lists/entities/list.entity';

import { UsersService } from 'src/users/users.service';
import { ItemsService } from 'src/items/items.service';
import { ListsService } from 'src/lists/lists.service';
import { ListItemService } from 'src/list-item/list-item.service';

import { SEED_ITEMS, SEED_LISTS, SEED_USERS } from './data/seed-data';

@Injectable()
export class SeedService {

    private isProd: Boolean;

    constructor(
        private readonly configService: ConfigService,

        private readonly usersService: UsersService,

        private readonly itemsService: ItemsService,

        private readonly listsService: ListsService,

        private readonly listItemService: ListItemService,

        @InjectRepository(Item)
        private readonly itemsRepository: Repository<Item>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(ListItem)
        private readonly listItemRepository: Repository<ListItem>,

        @InjectRepository(List)
        private readonly listRepository: Repository<List>,

    ) {
        this.isProd = configService.get('STATE') === 'prod';
    }

    async executeSeed() {

        if (this.isProd) throw new UnauthorizedException('We cannot run SEED on Prod');

        await this.deleteDatabase();
        const user = await this.loadUsers();
        await this.loadItems(user);
        const list = await this.loadList(user);

        const items = await this.itemsService.findAll(user, { limit: 10, offset: 0 }, {})
        await this.loadListItem(list, items);

        return true;
    }

    async deleteDatabase() {
        await this.listItemRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute();

        await this.listRepository.createQueryBuilder()
            .delete()
            .where({})
            .execute();

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

    async loadList(user: User): Promise<List> {
        const lists = [];
        for (const list of SEED_LISTS) {
            lists.push(await this.listsService.create(list, user));
        }
        return lists[0];
    }

    async loadListItem(list: List, items: Item[]) {
        for (const item of items) {
            this.listItemService.create({
                quantity: Math.round(Math.random() * 10),
                completed: Math.round(Math.random() * 1) === 0 ? false : true,
                listId: list.id,
                itemId: item.id
            });
        }
    }

}