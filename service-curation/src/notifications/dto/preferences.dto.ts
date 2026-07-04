import { IsOptional, IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdatePreferencesDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  review_reply?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  moderation_alert?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  platform_news?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  contact_request?: boolean;
}
