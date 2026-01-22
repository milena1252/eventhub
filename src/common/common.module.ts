import { Module } from "@nestjs/common";
import { LoggerInterceptor } from "./interceptors/logger.interceptor";

@Module({
    providers: [LoggerInterceptor],
    exports: [LoggerInterceptor],
})

export class CommonModule{}