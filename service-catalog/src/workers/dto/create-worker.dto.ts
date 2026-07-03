import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  IsUrl,
  Min,
  Max,
  MinLength,
  MaxLength,
  ArrayMaxSize,
  IsObject,
} from "class-validator";
import { ValidateBusinessHours } from "./validate-business-hours";

export class CreateWorkerDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsString()
  @IsNotEmpty()
  beach: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  coverImage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  @ArrayMaxSize(10)
  gallery?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  @ArrayMaxSize(10)
  tags?: string[];

  @IsOptional()
  @IsObject()
  @ValidateBusinessHours()
  businessHours?: Record<string, { open: string; close: string }>;
}
