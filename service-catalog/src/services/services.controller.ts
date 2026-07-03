import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiOperation } from "@nestjs/swagger";
import { ServicesService } from "./services.service";
import { CreateServiceDto } from "./dto/create-service.dto";
import { UpdateServiceDto } from "./dto/update-service.dto";
import { JwtAuthGuard } from "../common/auth/jwt-auth.guard";
import { RolesGuard } from "../common/auth/roles.guard";
import { Roles } from "../common/auth/roles.decorator";
import { CurrentUser } from "../common/auth/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-user";

@ApiTags("Services")
@Controller()
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post("catalog/workers/:id/services")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("WORKER")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Add service item to worker profile" })
  async create(
    @Param("id") profileId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateServiceDto,
  ) {
    const service = await this.servicesService.create(
      profileId,
      user.sub,
      dto,
    );
    return { data: service, meta: { requestId: "" } };
  }

  @Patch("catalog/services/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("WORKER")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Edit service item" })
  async update(
    @Param("id") serviceId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateServiceDto,
  ) {
    const service = await this.servicesService.update(
      serviceId,
      user.sub,
      dto,
    );
    return { data: service, meta: { requestId: "" } };
  }

  @Delete("catalog/services/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("WORKER")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Remove service item" })
  async delete(
    @Param("id") serviceId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.servicesService.delete(serviceId, user.sub);
  }
}
