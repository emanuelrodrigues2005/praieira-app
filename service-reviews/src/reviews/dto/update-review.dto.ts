import { IsInt, Min, Max, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateReviewDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  comment?: string;
}
