import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ListItem } from 'src/list-item/entities/list-item.entity';
import { User } from 'src/users/entities/user.entity';

@Entity({ name: 'lists' })
@ObjectType()
export class List {
    @PrimaryGeneratedColumn('uuid')
    @Field(() => ID)
    id: string;

    @Column()
    @Field(() => String)
    name: string;

    @ManyToOne(() => User, (user) => user.lists, { nullable: true, lazy: true })
    @Index('userId-list-index')
    @Field(() => User)
    user: User;

    @OneToMany(() => ListItem, (listItem) => listItem.list, { lazy: true })
    @Field(() => [ListItem])
    listItem: ListItem[];
}
