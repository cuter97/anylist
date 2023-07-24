import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateListInput } from './dto/create-list.input';
import { UpdateListInput } from './dto/update-list.input';

import { List } from './entities/list.entity';
import { User } from 'src/users/entities/user.entity';

import { PaginationArgs } from 'src/common/dto/args/pagination.args';
import { SearchArgs } from 'src/common/dto/args/search.args';

@Injectable()
export class ListsService {

    constructor(
        @InjectRepository(List)
        private readonly listsRespository: Repository<List>
    ) { }

    async create(createListInput: CreateListInput, user: User): Promise<List> {
        const newList = this.listsRespository.create({ ...createListInput, user });
        return await this.listsRespository.save(newList);
    }

    async findAll(user: User, paginationArgs: PaginationArgs, searchArgs: SearchArgs): Promise<List[]> {

        const { offset, limit } = paginationArgs;
        const { search } = searchArgs;

        const queryBuilder = this.listsRespository.createQueryBuilder()
            .take(limit)
            .skip(offset)
            .where('"userId" = :userId', { userId: user.id });

        if (search)
            queryBuilder.andWhere('LOWER(name) like :name', { name: `%${search.toLowerCase()}%` });

        return queryBuilder.getMany();
    }

    async findOne(id: string, user: User): Promise<List> {
        const list = await this.listsRespository.findOneBy({
            id,
            user: {
                id: user.id
            }
        });

        if (!list) throw new NotFoundException('List not found');

        return list;
    }

    async update(id: string, updateListInput: UpdateListInput, user: User): Promise<List> {
        await this.findOne(id, user);
        const list = await this.listsRespository.preload({
            ...updateListInput,
            user
        });

        if (!list) throw new NotFoundException('List not found');

        return this.listsRespository.save(list);
    }

    async remove(id: string, user: User): Promise<List> {
        const list = await this.findOne(id, user);
        await this.listsRespository.remove(list);
        return { ...list, id };
    }

    async listCountByUser(user: User): Promise<number> {
        return this.listsRespository.count({
            where: {
                user: {
                    id: user.id
                }
            }
        });
    }

}
