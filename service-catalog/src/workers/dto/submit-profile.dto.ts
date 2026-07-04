import { IsString, IsNotEmpty } from "class-validator";

export class SubmitProfileDto {
  @IsString()
  @IsNotEmpty()
  profileId: string;
}
