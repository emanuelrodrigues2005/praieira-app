import {
  IsUUID,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class CreateReviewDto {
  @IsUUID("4")
  workerProfileId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  comment?: string;
}
