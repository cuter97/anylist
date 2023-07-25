import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ListItemModule } from 'src/list-item/list-item.module';
import { ListsService } from './lists.service';
import { ListsResolver } from './lists.resolver';

import { List } from './entities/list.entity';

@Module({
    providers: [ListsResolver, ListsService],
    imports: [
        TypeOrmModule.forFeature([List]),
        ListItemModule
    ],
    exports: [ListsService, TypeOrmModule]
})
export class ListsModule { }
