import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { ValidRolesArgs } from './dto/args/roles.arg';

@Resolver(() => User)
export class UsersResolver {
    constructor(private readonly usersService: UsersService) { }

    @Query(() => [User], { name: 'users' })
    findAll(
        @Args() validRoles: ValidRolesArgs
    ): Promise<User[]> {
        return this.usersService.findAll(validRoles.roles);

        
    }

    @Query(() => User, { name: 'user' })
    findOne(@Args('id', { type: () => ID }) id: string): Promise<User> {
        // return this.usersService.findOne(id);
        //TODO
        throw new Error('not implemented')
    }

    @Mutation(() => User)
    blockUser(@Args('id', { type: () => ID }) id: string): Promise<User> {
        return this.usersService.block(id);
    }
}
