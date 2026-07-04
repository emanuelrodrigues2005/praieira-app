import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { AuthenticatedUser } from "./jwt.strategy";

@Injectable()
export class WorkerOwnershipGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser = request.user;
    if (!user) {
      return false;
    }

    // CURATOR can access any profile unrestricted
    if (user.role === "CURATOR" || user.role === "ADMIN") {
      return true;
    }

    // Only WORKER needs ownership verification
    if (user.role !== "WORKER") {
      throw new ForbiddenException("Access denied: invalid role");
    }

    const workerProfileId = request.params.id;
    if (!workerProfileId) {
      return false;
    }

    // Fetch worker profile from Catalog Service
    const catalogUrl = process.env.CATALOG_URL ?? "http://localhost:3002";
    const url = `${catalogUrl}/catalog/workers/${workerProfileId}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.status === 404) {
        throw new NotFoundException("Worker profile not found");
      }

      if (!response.ok) {
        throw new ServiceUnavailableException(`Catalog returned status ${response.status}`);
      }

      const body = await response.json();
      const profile = body?.data;

      if (!profile || typeof profile.ownerUserId !== "string") {
        throw new ServiceUnavailableException("Invalid response from Catalog");
      }

      if (profile.ownerUserId !== user.sub) {
        throw new ForbiddenException("You do not own this worker profile");
      }

      return true;
    } catch (error: any) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException ||
        error instanceof ServiceUnavailableException
      ) {
        throw error;
      }
      if (error?.name === "AbortError") {
        throw new ServiceUnavailableException("Catalog request timed out");
      }
      throw new ServiceUnavailableException(`Could not connect to Catalog Service: ${error.message}`);
    } finally {
      clearTimeout(timeout);
    }
  }
}
