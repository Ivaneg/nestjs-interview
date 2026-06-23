// import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

export class CreateItemDto {
  // @IsString()
  // @IsNotEmpty()
  name: string;
  // @IsBoolean()
  done: boolean;
}
