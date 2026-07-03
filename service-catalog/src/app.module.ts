import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { AppController } from "./app.controller";
import { JwtStrategy } from "./common/auth/jwt.strategy";
import { HttpExceptionFilter } from "./common/errors/http-exception.filter";
import { CorrelationMiddleware } from "./common/correlation/correlation.middleware";
import { PrismaModule } from "./prisma/prisma.module";
import { MessagingModule } from "./messaging/messaging.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
    }),
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? "dev-jwt-secret-change-in-production",
      signOptions: {
        algorithm: (process.env.JWT_ALGORITHM as any) ?? "HS256",
      },
    }),
    PrismaModule,
    MessagingModule,
  ],
  controllers: [AppController],
  providers: [
    JwtStrategy,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationMiddleware).forRoutes("*");
  }
}
