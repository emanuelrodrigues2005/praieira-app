import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RejectRequestDto {
  @ApiProperty({ description: "Código do motivo da rejeição" })
  @IsNotEmpty()
  @IsString()
  reasonCode: string;

  @ApiProperty({ description: "Notas detalhadas explicando o que corrigir" })
  @IsNotEmpty()
  @IsString()
  notes: string;
}
