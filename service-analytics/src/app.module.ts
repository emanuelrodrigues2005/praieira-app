import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { AppController } from "./app.controller";
import { AnalyticsController } from "./analytics.controller";
import { ProfileView, ProfileViewSchema } from "./schemas/profile-view.schema";
import { ProcessedEvent, ProcessedEventSchema } from "./schemas/processed-event.schema";
import { WorkerDailyMetrics, WorkerDailyMetricsSchema } from "./schemas/worker-daily-metrics.schema";
import { JwtStrategy } from "./common/auth/jwt.strategy";
import { AnalyticsService } from "./analytics.service";
import { RabbitMqTopologyService } from "./messaging/rabbitmq-topology.service";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? "dev-jwt-secret-change-in-production",
      signOptions: {
        algorithm: (process.env.JWT_ALGORITHM as any) ?? "HS256",
      },
    }),
    MongooseModule.forRoot(
      process.env.MONGO_URL ?? "mongodb://localhost:27017/db_analytics",
    ),
    MongooseModule.forFeature([
      { name: ProfileView.name, schema: ProfileViewSchema },
      { name: ProcessedEvent.name, schema: ProcessedEventSchema },
      { name: WorkerDailyMetrics.name, schema: WorkerDailyMetricsSchema },
    ]),
  ],
  controllers: [AppController, AnalyticsController],
  providers: [JwtStrategy, AnalyticsService, RabbitMqTopologyService],
})
export class AppModule {}
