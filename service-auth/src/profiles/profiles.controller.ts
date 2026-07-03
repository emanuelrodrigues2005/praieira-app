import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Inject,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from "@nestjs/swagger";
import { ProfilesService } from "./profiles.service";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { JwtAuthGuard } from "../common/auth/jwt-auth.guard";
import { CurrentUser } from "../common/auth/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { SuccessResponse } from "../common/http/response.interface";
import { CORRELATION_ID_KEY } from "../common/correlation/correlation.middleware";
import { REQUEST } from "@nestjs/core";

@ApiTags("Profiles")
@Controller("profiles")
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    @Inject(REQUEST) private readonly request: any,
  ) {}

  @Get(":id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get a basic profile by ID" })
  async findOne(@Param("id") id: string): Promise<SuccessResponse<any>> {
    const result = await this.profilesService.findOne(id);
    return {
      data: result,
      meta: {
        requestId: this.request[CORRELATION_ID_KEY] || "system",
      },
    };
  }

  @Patch("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update own user profile details" })
  async updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<SuccessResponse<any>> {
    const result = await this.profilesService.updateMe(user.sub, dto);
    return {
      data: result,
      meta: {
        requestId: this.request[CORRELATION_ID_KEY] || "system",
      },
    };
  }
}
