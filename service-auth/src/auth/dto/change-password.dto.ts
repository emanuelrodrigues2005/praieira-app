import { IsNotEmpty, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ChangePasswordDto {
  @ApiProperty({ description: "Senha atual do usuário" })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: "currentPassword must be at least 8 characters long" })
  currentPassword: string;

  @ApiProperty({ description: "Nova senha do usuário (mínimo 8 caracteres)" })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: "newPassword must be at least 8 characters long" })
  newPassword: string;
}
