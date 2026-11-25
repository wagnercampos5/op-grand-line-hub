"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    const corsOrigin = configService.get('CORS_ORIGIN') ?? 'http://localhost:5173';
    app.enableCors({
        origin: corsOrigin,
        credentials: true,
    });
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('Grand Line Hub API')
        .setDescription('API oficial do Grand Line Hub — Crônicas da Grand Line, Tripulações e Mural de Contratos.')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const documentFactory = () => swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, documentFactory);
    app.enableShutdownHooks();
    const port = configService.get('PORT') ?? 3000;
    await app.listen(port);
}
void bootstrap();
//# sourceMappingURL=main.js.map