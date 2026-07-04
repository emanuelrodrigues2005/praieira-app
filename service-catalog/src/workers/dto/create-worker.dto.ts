import { ApiPropertyOptional } from "@nestjs/swagger";
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

  @ApiPropertyOptional({ description: "Cover image URL for the profile", example: "https://example.com/cover.jpg" })
  @IsOptional()
  @IsString()
  @IsUrl()
  coverImage?: string;

  @ApiPropertyOptional({ description: "Gallery of image URLs (max 10)", example: ["https://example.com/photo1.jpg"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsUrl({}, { each: true })
  @ArrayMaxSize(10)
  gallery?: string[];

  @ApiPropertyOptional({ description: "Tags describing the business (max 10, each max 50 chars)", example: ["Frutos do Mar", "Pet Friendly"] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  @ArrayMaxSize(10)
  tags?: string[];

  @ApiPropertyOptional({
    description: "Business hours per day (Portuguese abbreviations: seg, ter, qua, qui, sex, sab, dom)",
    example: { seg: { open: "08:00", close: "18:00" }, sab: { open: "09:00", close: "13:00" } },
  })
  @IsOptional()
  @IsObject()
  @ValidateBusinessHours()
  businessHours?: Record<string, { open: string; close: string }>;
}
