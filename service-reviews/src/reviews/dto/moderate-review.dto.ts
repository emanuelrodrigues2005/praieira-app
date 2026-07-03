import { IsString, IsIn, MinLength, MaxLength } from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class ModerateReviewDto {
  @ApiProperty({ description: "Action: HIDDEN or REMOVED", enum: ["HIDDEN", "REMOVED"] })
  @IsString()
  @IsIn(["HIDDEN", "REMOVED"])
  action!: "HIDDEN" | "REMOVED";

  @ApiProperty({ description: "Moderation reason", maxLength: 500 })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  reason!: string;
}
