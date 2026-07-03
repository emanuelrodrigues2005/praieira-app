import {
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  ValidateIf,
} from "class-validator";
import { Transform } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateReviewDto {
  @ApiPropertyOptional({ description: "New rating 1-5" })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ description: "New comment (1-1000 chars)" })
  @IsOptional()
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  comment?: string;

  // At least one field must be present
  @ValidateIf((o) => o.rating === undefined && o.comment === undefined)
  @IsString({ message: "At least one field (rating or comment) must be provided" })
  private readonly _atLeastOne?: string;
}
