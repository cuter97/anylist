import { ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args, ID, ResolveField, Int, Parent } from '@nestjs/graphql';

import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { ValidRolesArgs } from './dto/args/roles.arg';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { ValidRoles } from 'src/auth/enums/valid-role.enum';
import { UpdateUserInput } from './dto/update-user.input';
import { ItemsService } from 'src/items/items.service';

@Resolver(() => User)
@UseGuards(JwtAuthGuard)
export class UsersResolver {
    constructor(
        private readonly usersService: UsersService,
        private readonly itemService: ItemsService
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

}
