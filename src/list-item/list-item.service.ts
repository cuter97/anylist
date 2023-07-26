import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateListItemInput } from './dto/create-list-item.input';
import { UpdateListItemInput } from './dto/update-list-item.input';

import { ListItem } from './entities/list-item.entity';
import { List } from 'src/lists/entities/list.entity';

import { PaginationArgs } from 'src/common/dto/args/pagination.args';
import { SearchArgs } from 'src/common/dto/args/search.args';

@Injectable()
export class ListItemService {

    constructor(
        @InjectRepository(ListItem)
        private readonly listItemRepository: Repository<ListItem>,
    ) { }

    async create(createListItemInput: CreateListItemInput): Promise<ListItem> {
        const { listId, itemId, ...rest } = createListItemInput;

        const newListItem = this.listItemRepository.create({
            ...rest,
            item: { id: itemId },
            list: { id: listId }
        });

        return this.listItemRepository.save(newListItem);
    }

    async findAll(list: List, paginationArgs: PaginationArgs, searchArgs: SearchArgs): Promise<ListItem[]> {
        const { limit, offset } = paginationArgs;
        const { search } = searchArgs;

        const queryBuilder = this.listItemRepository.createQueryBuilder('listItem')
            .innerJoin('listItem.item', 'item')
            .take(limit)
            .skip(offset)
            .where('"listId" = :listId', { listId: list.id });

        if (search)
            queryBuilder.andWhere('LOWER(item.name) like :name', { name: `%${search.toLowerCase()}%` });

        return queryBuilder.getMany();
    }

    async findOne(id: string): Promise<ListItem> {
        const listItem = await this.listItemRepository.findOneBy({ id });

        if (!listItem) throw new NotFoundException('List not found');

        return listItem;
    }

    async update(id: string, updateListItemInput: UpdateListItemInput): Promise<ListItem> {
        const { listId, itemId, ...rest } = updateListItemInput;

        const queryBuilder = this.listItemRepository.createQueryBuilder()
            .update()
            .set(rest)
            .where('id = :id', { id });

        if (!listId) queryBuilder.set({
            list: { id: listId }
        });

        if (!itemId) queryBuilder.set({
            item: { id: itemId }
        });

        await queryBuilder.execute();

        return this.findOne(id);
    }

    async countListItemsByList(list: List): Promise<number> {
        return this.listItemRepository.count({
            where: { list: { id: list.id } }
        });
    }
}
