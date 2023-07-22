import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { ParseUUIDPipe, UseGuards } from '@nestjs/common';

import { ItemsService } from './items.service';
import { Item } from './entities/item.entity';
import { CreateItemInput } from './dto/create-item.input';
import { UpdateItemInput } from './dto/update-item.input';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { User } from 'src/users/entities/user.entity';

@Resolver(() => Item)
@UseGuards(JwtAuthGuard)
export class ItemsResolver {
    constructor(private readonly itemsService: ItemsService) { }

    @Mutation(() => Item, { name: 'createItem' })
    async createItem(
        @Args('createItemInput') createItemInput: CreateItemInput,
        @CurrentUser() user: User
    ): Promise<Item> {
        return this.itemsService.create(createItemInput, user);
    }

    @Query(() => [Item], { name: 'items' })
    async findAll(
        @CurrentUser() user: User
    ): Promise<Item[]> {
        return this.itemsService.findAll(user);
    }

    @Query(() => Item, { name: 'item' })
    async findOne(
        @Args('id', { type: () => ID }, ParseUUIDPipe) id: string
    ): Promise<Item> {
        return this.itemsService.findOne(id);
    }

    @Mutation(() => Item)
    async updateItem(
        @Args('updateItemInput') updateItemInput: UpdateItemInput
    ): Promise<Item> {
        return this.itemsService.update(updateItemInput.id, updateItemInput);
    }

    @Mutation(() => Item)
    removeItem(@Args('id', { type: () => ID }) id: string): Promise<Item> {
        return this.itemsService.remove(id);
    }
}
