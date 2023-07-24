import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ID, ResolveField, Int, Parent } from '@nestjs/graphql';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { UsersService } from './users.service';
import { ItemsService } from 'src/items/items.service';
import { ListsService } from 'src/lists/lists.service';

import { User } from './entities/user.entity';
import { Item } from 'src/items/entities/item.entity';
import { List } from 'src/lists/entities/list.entity';

import { ValidRolesArgs } from './dto/args/roles.arg';
import { UpdateUserInput } from './dto/update-user.input';

import { SearchArgs } from 'src/common/dto/args/search.args';
import { PaginationArgs } from 'src/common/dto/args/pagination.args';

import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { ValidRoles } from 'src/auth/enums/valid-role.enum';

@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
    constructor(
        private readonly usersService: UsersService,
        private readonly itemService: ItemsService,
        private readonly listsService: ListsService,
    ) { }

    @Query(() => [User], { name: 'users' })
    findAll(
        @Args() validRoles: ValidRolesArgs,
        @CurrentUser([ValidRoles.admin]) user: User
    ): Promise<User[]> {
        return this.usersService.findAll(validRoles.roles);
    }

    @Query(() => User, { name: 'user' })
    findOne(
        @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
        @CurrentUser([ValidRoles.admin]) user: User
    ): Promise<User> {
        return this.usersService.findOneById(id);
    }

    @Mutation(() => User, { name: 'blockUser' })
    blockUser(
        @Args('id', { type: () => ID }, ParseUUIDPipe) id: string,
        @CurrentUser([ValidRoles.admin]) user: User
    ): Promise<User> {
        return this.usersService.block(id, user);
    }

    @Mutation(() => User, { name: 'updateUser' })
    updateUser(
        @Args('updateUserInput') updateUserInput: UpdateUserInput,
        @CurrentUser([ValidRoles.admin]) user: User
    ): Promise<User> {
        return this.usersService.update(updateUserInput.id, updateUserInput, user);
    }

    @ResolveField(() => Int, { name: 'itemCount' })
    async itemCount(
        @CurrentUser([ValidRoles.admin]) adminUser: User,
        @Parent() user: User
    ): Promise<number> {
        return this.itemService.itemCountByUser(user);
    }

    @ResolveField(() => Int, { name: 'listCount' })
    async listCount(
        @CurrentUser([ValidRoles.admin]) adminUser: User,
        @Parent() user: User
    ): Promise<number> {
        return this.listsService.listCountByUser(user);
    }

    @ResolveField(() => [Item], { name: 'items' })
    async getItemsByUser(
        @CurrentUser([ValidRoles.admin]) adminUser: User,
        @Parent() user: User,
        @Args() paginationArgs: PaginationArgs,
        @Args() searchArgs: SearchArgs,
    ): Promise<Item[]> {
        return this.itemService.findAll(user, paginationArgs, searchArgs);
    }

    @ResolveField(() => [List], { name: 'lists' })
    async getListByUser(
        @CurrentUser([ValidRoles.admin]) adminUser: User,
        @Parent() user: User,
        @Args() paginationArgs: PaginationArgs,
        @Args() searchArgs: SearchArgs,
    ): Promise<List[]> {
        return this.listsService.findAll(user, paginationArgs, searchArgs);
    }

}
