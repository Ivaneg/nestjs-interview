// import { PartialType } from '@nestjs/mapped-types';
// import { IsString, IsBoolean } from 'class-validator';

export class UpdateItemDto {
  // @IsString()
  name?: string;
  // @IsBoolean()
  done?: boolean;
}
