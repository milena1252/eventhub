import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEvents1770566636964 implements MigrationInterface {
    name = 'CreateEvents1770566636964'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."notification_log_type_enum" AS ENUM('EVENT_UPDATED', 'EVENT_CANCELLED', 'EVENT_DEACTIVATED', 'EVENT_REACTIVATED')`);
        await queryRunner.query(`CREATE TYPE "public"."notification_log_channel_enum" AS ENUM('email', 'telegram')`);
        await queryRunner.query(`CREATE TYPE "public"."notification_log_status_enum" AS ENUM('pending', 'sent', 'failed')`);
        await queryRunner.query(`CREATE TABLE "notification_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "eventId" uuid NOT NULL, "userId" uuid NOT NULL, "message" character varying, "type" "public"."notification_log_type_enum", "channel" "public"."notification_log_channel_enum" NOT NULL, "status" "public"."notification_log_status_enum" NOT NULL DEFAULT 'pending', "error" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6f761cfbbd064e0f326960877d6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_da1583bbff11f436aa6036e1f1" ON "notification_log" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_8d77d2c363cf7e32c3f93a015f" ON "notification_log" ("channel") `);
        await queryRunner.query(`CREATE INDEX "IDX_bbdec870a684a910d0a81e1afe" ON "notification_log" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_2f40110b0e8bd7f9e6ec23c930" ON "notification_log" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_5796424847ff33b2844d4d08e3" ON "notification_log" ("eventId") `);
        await queryRunner.query(`CREATE TABLE "subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "eventId" uuid NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fac2e04480fa518c258195d21f" ON "subscriptions" ("isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_fbdba4e2ac694cf8c9cecf4dc8" ON "subscriptions" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_2dab1a1c63ff25f08fff8149c5" ON "subscriptions" ("eventId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_820afc8f2f05a0bb2aa9d4494d" ON "subscriptions" ("userId", "eventId") `);
        await queryRunner.query(`CREATE TABLE "events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "description" text NOT NULL, "creatorId" uuid NOT NULL, "startAt" TIMESTAMP WITH TIME ZONE NOT NULL, "endAt" TIMESTAMP WITH TIME ZONE, "isActive" boolean NOT NULL DEFAULT true, "subscribersCount" integer NOT NULL DEFAULT '0', "isPopular" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_dad02f90491c8dfe2610d05f8d" ON "events" ("startAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_4d52333299ac627013f6238fd1" ON "events" ("isPopular") `);
        await queryRunner.query(`CREATE INDEX "IDX_a5be9dba064b5a2df1d40de97c" ON "events" ("isActive") `);
        await queryRunner.query(`CREATE INDEX "IDX_c621508a2b84ae21d3f971cdb4" ON "events" ("creatorId") `);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('USER', 'ADMIN')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."outbox_status_enum" AS ENUM('PENDING', 'PROCESSED', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "outbox" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying NOT NULL, "payload" jsonb NOT NULL, "status" "public"."outbox_status_enum" NOT NULL DEFAULT 'PENDING', "error" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_340ab539f309f03bdaa14aa7649" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_13c48977782395de009ddca652" ON "outbox" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_c0a97287efc99f7e6274658e98" ON "outbox" ("status") `);
        await queryRunner.query(`CREATE TABLE "notification_stats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "total" integer NOT NULL DEFAULT '0', "sent" integer NOT NULL DEFAULT '0', "failed" integer NOT NULL DEFAULT '0', "pending" integer NOT NULL DEFAULT '0', "calculateAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_245d959a1707992aba1ac78f87c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_eb5ef030e8e588de11c96a60d5" ON "notification_stats" ("calculateAt") `);
        await queryRunner.query(`ALTER TABLE "notification_log" ADD CONSTRAINT "FK_5796424847ff33b2844d4d08e3c" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notification_log" ADD CONSTRAINT "FK_2f40110b0e8bd7f9e6ec23c930d" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_2dab1a1c63ff25f08fff8149c5d" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "FK_c621508a2b84ae21d3f971cdb47" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_c621508a2b84ae21d3f971cdb47"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_2dab1a1c63ff25f08fff8149c5d"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_fbdba4e2ac694cf8c9cecf4dc84"`);
        await queryRunner.query(`ALTER TABLE "notification_log" DROP CONSTRAINT "FK_2f40110b0e8bd7f9e6ec23c930d"`);
        await queryRunner.query(`ALTER TABLE "notification_log" DROP CONSTRAINT "FK_5796424847ff33b2844d4d08e3c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_eb5ef030e8e588de11c96a60d5"`);
        await queryRunner.query(`DROP TABLE "notification_stats"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c0a97287efc99f7e6274658e98"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_13c48977782395de009ddca652"`);
        await queryRunner.query(`DROP TABLE "outbox"`);
        await queryRunner.query(`DROP TYPE "public"."outbox_status_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c621508a2b84ae21d3f971cdb4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a5be9dba064b5a2df1d40de97c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4d52333299ac627013f6238fd1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dad02f90491c8dfe2610d05f8d"`);
        await queryRunner.query(`DROP TABLE "events"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_820afc8f2f05a0bb2aa9d4494d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2dab1a1c63ff25f08fff8149c5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fbdba4e2ac694cf8c9cecf4dc8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fac2e04480fa518c258195d21f"`);
        await queryRunner.query(`DROP TABLE "subscriptions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5796424847ff33b2844d4d08e3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2f40110b0e8bd7f9e6ec23c930"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bbdec870a684a910d0a81e1afe"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8d77d2c363cf7e32c3f93a015f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_da1583bbff11f436aa6036e1f1"`);
        await queryRunner.query(`DROP TABLE "notification_log"`);
        await queryRunner.query(`DROP TYPE "public"."notification_log_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_log_channel_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_log_type_enum"`);
    }

}
