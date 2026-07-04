import { IsEnum, IsOptional, IsString, IsIn } from "class-validator";
import { ContactChannel } from "@prisma/client";

export class CreateContactInteractionDto {
  @IsEnum(ContactChannel)
  channel!: ContactChannel;

  @IsOptional()
  @IsString()
  @IsIn(["PROFILE_DETAIL", "MAP", "SEARCH_RESULT"])
  source?: string;
}
