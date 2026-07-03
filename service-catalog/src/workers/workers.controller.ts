import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Req,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags, ApiOperation } from "@nestjs/swagger";
import { WorkersService } from "./workers.service";
import { CreateWorkerDto } from "./dto/create-worker.dto";
import { UpdateWorkerDto } from "./dto/update-worker.dto";
import { JwtAuthGuard } from "../common/auth/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../common/auth/optional-jwt-auth.guard";
import { RolesGuard } from "../common/auth/roles.guard";
import { Roles } from "../common/auth/roles.decorator";
import { CurrentUser } from "../common/auth/current-user.decorator";
import { Public } from "../common/auth/public.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-user";
import { Request } from "express";

@ApiTags("Workers")
@Controller("catalog/workers")
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("WORKER")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create draft worker profile" })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateWorkerDto,
  ) {
    const profile = await this.workersService.create(user.sub, dto);
    return { data: profile, meta: { requestId: "" } };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("WORKER")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List own worker profiles" })
  async findMyProfiles(@CurrentUser() user: AuthenticatedUser) {
    const profiles = await this.workersService.findByOwner(user.sub);
    return { data: profiles, meta: { requestId: "" } };
  }

  @Get(":id")
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "View worker profile detail" })
  async findById(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser | null,
    @Req() req: Request,
  ) {
    const userId = user?.sub;
    const profile = await this.workersService.findById(id, userId);

    if (!profile) {
      throw new NotFoundException("Worker profile not found");
    }

    // Emit view event for non-owner views
    if (!userId || profile.ownerUserId !== userId) {
      const viewerRole =
        user?.role === "TOURIST"
          ? "TOURIST"
          : user?.role ?? "UNAUTHENTICATED";
      // Fire-and-forget — don't await
      this.workersService.emitProfileViewed(
        profile.id,
        profile.beach,
        viewerRole,
      );
    }

    return { data: profile, meta: { requestId: "" } };
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("WORKER")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Edit own worker profile" })
  async update(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateWorkerDto,
  ) {
    const profile = await this.workersService.update(id, user.sub, dto);
    return { data: profile, meta: { requestId: "" } };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("WORKER")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete own worker profile" })
  async delete(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.workersService.delete(id, user.sub);
  }
}
