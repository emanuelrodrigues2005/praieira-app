import { IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ApproveRequestDto {
  @ApiProperty({ required: false, description: "Notas opcionais da aprovação" })
  @IsOptional()
  @IsString()
  notes?: string;
}
