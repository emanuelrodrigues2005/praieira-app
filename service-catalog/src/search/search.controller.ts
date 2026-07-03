import { Controller, Get, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { SearchService, PaginatedResponse, WorkerProfileSearchResult } from "./search.service";
import { SearchQueryDto } from "./dto/search-query.dto";
import { Public } from "../common/auth/public.decorator";

@ApiTags("Search")
@Controller("catalog/search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: "Search approved worker profiles" })
  async search(@Query() query: SearchQueryDto): Promise<PaginatedResponse<WorkerProfileSearchResult>> {
    return this.searchService.search(query);
  }
}
