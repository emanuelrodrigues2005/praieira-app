import { IsString, MinLength, IsIn, IsOptional } from "class-validator";
import { ReportReason } from "@prisma/client";

export class CreateReportDto {
  @IsString()
  @IsIn(["ABUSIVE_CONTENT", "SPAM", "FALSE_INFORMATION", "OTHER"])
  reason!: ReportReason;

  @IsOptional()
  @IsString()
  details?: string;
}
