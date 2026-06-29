import { IsString, IsIn, MinLength } from "class-validator";

export class ModerateReviewDto {
  @IsString()
  @IsIn(["HIDDEN", "REMOVED"])
  action!: "HIDDEN" | "REMOVED";

  @IsString()
  @MinLength(1)
  reason!: string;
}
