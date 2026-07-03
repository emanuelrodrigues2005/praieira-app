import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;
}
