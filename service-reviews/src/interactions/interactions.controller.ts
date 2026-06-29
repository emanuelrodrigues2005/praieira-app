import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from "@nestjs/swagger";
import { Request } from "express";
import { InteractionsService } from "./interactions.service";
import { CreateContactInteractionDto } from "./dto/create-contact-interaction.dto";
import { OptionalJwtAuthGuard } from "../common/auth/optional-jwt-auth.guard";
import { CurrentUser } from "../common/auth/current-user.decorator";
import { AuthenticatedUser } from "../common/types/authenticated-user";

@ApiTags("Interactions")
@Controller("interactions")
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Post("contact/:workerProfileId")
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: "Register a contact interaction" })
  @ApiParam({ name: "workerProfileId", description: "Worker profile UUID" })
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: "Contact registered" })
  @ApiResponse({ status: 404, description: "Worker profile not found" })
  async registerContact(
    @Param("workerProfileId") workerProfileId: string,
    @Body() dto: CreateContactInteractionDto,
    @CurrentUser() user: AuthenticatedUser | null,
    @Req() req: Request,
  ) {
    const result = await this.interactionsService.registerContact(
      workerProfileId,
      dto,
      user,
    );
    return {
      data: result,
      meta: { requestId: req.headers["x-correlation-id"] as string },
    };
  }
}
