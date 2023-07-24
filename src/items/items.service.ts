import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';

import { CreateItemInput } from './dto/create-item.input';
import { UpdateItemInput } from './dto/update-item.input';

import { PaginationArgs } from 'src/common/dto/args/pagination.args';
import { SearchArgs } from 'src/common/dto/args/search.args';

import { Item } from './entities/item.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ItemsService {

    constructor(
        @InjectRepository(Item)
        private readonly itemsRepository: Repository<Item>
    ) { }

    async create(createItemInput: CreateItemInput, user: User): Promise<Item> {
        const newItem = this.itemsRepository.create({ ...createItemInput, user });
        return await this.itemsRepository.save(newItem);
    }

    async findAll(user: User, paginationArgs: PaginationArgs, searchArgs: SearchArgs): Promise<Item[]> {

        const { offset, limit } = paginationArgs;
        const { search } = searchArgs;

        const queryBuilder = this.itemsRepository.createQueryBuilder()
            .take(limit)
            .skip(offset)
            .where('"userId" = :userId', { userId: user.id });

        if (search)
            queryBuilder.andWhere('LOWER(name) like :name', { name: `%${search.toLowerCase()}%` });

        return queryBuilder.getMany();

        // return this.itemsRepository.find({
        //     take: limit,
        //     skip: offset,
        //     where: {
        //         user: {
        //             id: user.id
        //         },
        //         name: Like(`%${search}%`)
        //     }
        // });
    }

    async findOne(id: string, user: User): Promise<Item> {
        const item = await this.itemsRepository.findOneBy({
            id,
            user: {
                id: user.id
            }
        });

        if (!item) throw new NotFoundException('Item not found');

        // otra forma de hacer sin usar lazy en item.entity.ts
        // item.user = user;

        return item;
    }

    async update(id: string, updateItemInput: UpdateItemInput, user: User): Promise<Item> {
        await this.findOne(id, user);
        const item = await this.itemsRepository.preload(updateItemInput);

        if (!item) throw new NotFoundException('Item not found');

        return this.itemsRepository.save(item);
    }

    async remove(id: string, user: User): Promise<Item> {
        //TODO: soft delete, integridad referencial
        const item = await this.findOne(id, user);

        await this.itemsRepository.remove(item);

        return { ...item, id };
    }

    async itemCountByUser(user: User): Promise<number> {
        return this.itemsRepository.count({
            where: {
                user: {
                    id: user.id
                }
            }
        })
    }

}
