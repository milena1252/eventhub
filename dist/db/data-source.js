"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("dotenv/config");
const typeorm_1 = require("typeorm");
const base = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
};
exports.AppDataSource = new typeorm_1.DataSource({
    ...base,
    entities: ['src/**/*.entity.ts'],
    migrations: ['src/migrations/*{.ts,.js}'],
    synchronize: false,
});
exports.default = exports.AppDataSource;
//# sourceMappingURL=data-source.js.map