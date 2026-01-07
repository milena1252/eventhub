declare const _default: (() => {
    nodeEnv: string;
    type: string;
    host: string | undefined;
    port: number;
    username: string | undefined;
    password: string | undefined;
    database: string | undefined;
    synchronize: boolean;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    nodeEnv: string;
    type: string;
    host: string | undefined;
    port: number;
    username: string | undefined;
    password: string | undefined;
    database: string | undefined;
    synchronize: boolean;
}>;
export default _default;
