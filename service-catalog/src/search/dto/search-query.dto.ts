import {
  IsOptional,
  IsString,
  IsInt,
  IsNumber,
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
  @Max(100_000)
  @Type(() => Number)
  radius?: number;

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
