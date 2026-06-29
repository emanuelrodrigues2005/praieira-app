import { IsEnum, IsOptional, IsInt, Min } from "class-validator";
import { Type } from "class-transformer";
import { ReviewStatus } from "@prisma/client";

export class ListReviewsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
