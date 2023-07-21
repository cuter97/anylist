import { registerEnumType } from "@nestjs/graphql";

export enum ValidRoles {
    admin = 'admin',
    user = 'aser',
    superUser = 'superUser'
}

registerEnumType(ValidRoles, { name: 'ValidRoles' })