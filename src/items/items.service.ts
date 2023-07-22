import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateItemInput } from './dto/create-item.input';
import { UpdateItemInput } from './dto/update-item.input';
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

    async findAll(user: User): Promise<Item[]> {
        return this.itemsRepository.find({
            where: {
                user: {
                    id: user.id
                }
            }
        });
    }

    async findOne(id: string): Promise<Item> {
        const item = await this.itemsRepository.findOneBy({ id });

        if (!item) throw new NotFoundException('Item not found');

        return item;
    }

    async update(id: string, updateItemInput: UpdateItemInput): Promise<Item> {
        const item = await this.itemsRepository.preload(updateItemInput);

        if (!item) throw new NotFoundException('Item not found');

        return this.itemsRepository.save(item);
    }

    async remove(id: string): Promise<Item> {
        //TODO: soft delete, integridad referencial
        const item = await this.findOne(id);

        await this.itemsRepository.remove(item);

        return { ...item, id };
    }
}
