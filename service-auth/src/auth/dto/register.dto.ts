import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsIn } from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ description: "Nome do usuário" })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ description: "Email do usuário" })
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email: string;

  @ApiProperty({ description: "Senha (mínimo 8 caracteres)" })
  @IsNotEmpty()
  @MinLength(8, { message: "password must be at least 8 characters long" })
  password: string;

  @ApiProperty({ enum: ["TOURIST", "WORKER"] })
  @IsNotEmpty()
  @IsIn(["TOURIST", "WORKER"])
  role: "TOURIST" | "WORKER";

  @ApiProperty({ required: false, description: "Telefone opcional" })
  @IsOptional()
  @IsString()
  phone?: string;
}
