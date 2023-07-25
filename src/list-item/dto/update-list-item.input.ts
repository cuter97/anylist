import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { CreateListItemInput } from './create-list-item.input';
import { IsUUID } from 'class-validator';

@InputType()
export class UpdateListItemInput extends PartialType(CreateListItemInput) {
    @Field(() => ID)
    @IsUUID()
    id: string;
}
