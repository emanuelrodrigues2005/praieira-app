import {
  IsOptional,
  IsString,
  IsInt,
  IsNumber,
  IsIn,
  Min,
  Max,
  MaxLength,
} from "class-validator";
import { Type } from "class-transformer";

export class SearchQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  text?: string;

  @IsOptional()
  @IsString()
  beach?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  lat?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  lng?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  @Type(() => Number)
  radius?: number;

  @IsOptional()
  @IsString()
  @IsIn(["proximity", "rating"])
  sort?: "proximity" | "rating" = "proximity";

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;
}
