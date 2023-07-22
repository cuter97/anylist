import { IsArray, IsBoolean, IsOptional, IsUUID } from 'class-validator';
import { CreateUserInput } from './create-user.input';
import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { ValidRoles } from 'src/auth/enums/valid-role.enum';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
    //como es un partialType de createUserInput las propiedades que vienen del 
    //createUserInput van a ser marcadas opcionales menos el id
    @Field(() => ID)
    @IsUUID()
    id: string;

    @Field(() => [ValidRoles], { nullable: true })
    @IsArray()
    @IsOptional()
    roles?: ValidRoles[];
    
    @Field(() => Boolean, { nullable: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
