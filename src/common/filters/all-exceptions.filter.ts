import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { error } from "console";
import { Request, Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const timestamp = new Date().toISOString();

        //HttpException
        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const res = exception.getResponse();

            const payload = 
                typeof res === 'string' 
                    ? {message: res} 
                    : (res as Record<string, any>);

            const message = payload.message ?? exception.message;

            return response.status(status).json({
                statusCode: status,
                path: request.url,
                method: request.method,
                timestamp,
                error: payload.error ?? HttpStatus[status],
                message,
            });
        }

        //любая др ошибка
        const status = HttpStatus.INTERNAL_SERVER_ERROR;

        const message = exception instanceof Error ? exception.message : 'Internal server error';

        return response.status(status).json({
            statusCode: status,
            path: request.url,
            method: request.method,
            timestamp,
            error: 'Internal server error',
            message,
        });   
    }
}

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMmEzYzUzZS05N2I3LTRjYTgtOGM5Yy0yZGFmNWY0MTk0M2EiLCJlbWFpbCI6InVzZXIyQHRlc3QuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NzA4MTE5MDUsImV4cCI6MTc3MDgxNTUwNX0.NwxshaxhyeHyUgrqjNTmtNd0z-IpNauHTHkh9S3YgR4