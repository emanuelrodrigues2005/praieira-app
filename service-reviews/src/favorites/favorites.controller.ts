import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { Request } from "express";
import { FavoritesService } from "./favorites.service";
import { ListFavoritesQueryDto } from "./dto/list-favorites-query.dto";
import { JwtAuthGuard } from "../common/auth/jwt-auth.guard";
import { RolesGuard } from "../common/auth/roles.guard";
import { Roles } from "../common/auth/roles.decorator";
import { CurrentUser } from "../common/auth/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-user";

@ApiTags("Favorites")
@Controller("favorites")
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("TOURIST")
  @ApiBearerAuth()
  @ApiOperation({ summary: "List user's favorites grouped by beach" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({ status: 200, description: "Favorites grouped by beach" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListFavoritesQueryDto,
    @Req() req: Request,
  ) {
    const result = await this.favoritesService.list(user.sub, query);
    return {
      ...result,
      meta: {
        ...result.meta,
        requestId: req.headers["x-correlation-id"] as string,
      },
    };
  }

  @Post(":workerId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("TOURIST")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Add a worker profile to favorites" })
  @ApiParam({ name: "workerId", description: "Worker profile UUID" })
  @ApiResponse({ status: 201, description: "Favorite created" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Worker profile not found" })
  @ApiResponse({ status: 409, description: "Already favorited" })
  @HttpCode(HttpStatus.CREATED)
  async add(
    @Param("workerId") workerId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    const favorite = await this.favoritesService.add(workerId, user);
    return {
      data: favorite,
      meta: { requestId: req.headers["x-correlation-id"] as string },
    };
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("TOURIST")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Remove a favorite" })
  @ApiParam({ name: "id", description: "Favorite UUID" })
  @ApiResponse({ status: 204, description: "Favorite removed" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Favorite not found" })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    await this.favoritesService.remove(id, user);
  }
}
