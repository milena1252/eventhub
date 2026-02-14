import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { PinoLogger } from "nestjs-pino";
import { Observable, tap } from "rxjs";

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
    constructor(private readonly logger: PinoLogger) {
        this.logger.setContext(LoggerInterceptor.name);
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const { method, url } = req;

        const start = Date.now();

        this.logger.info({ method, url }, 'Request');

        return next.handle().pipe(
            tap(() => {
                const ms = Date.now() - start;
                this.logger.info(
                    { method, url, ms },
                    'Responce',
                );
            }),
        );
    }
}