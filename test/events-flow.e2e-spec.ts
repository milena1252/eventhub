import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from 'supertest';
import { AppModule } from "src/app.module";
import { NotificationLog } from "src/notifications/notification-log.entity";
import { DataSource } from "typeorm";
import { OutboxService } from "src/outbox/outbox.service";
import { Outbox } from "src/outbox/outbox.entity";

describe('Events flow (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let outboxService: OutboxService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get(DataSource);
    outboxService = moduleFixture.get(OutboxService);
  });

  beforeEach(async () => {
    //чистим таблицы перед каждым тестом
      await dataSource.query(`
      TRUNCATE TABLE
        notification_log,
        subscriptions,
        outbox,
        events,
        users
      RESTART IDENTITY CASCADE;
    `);
  });

  afterAll(async () => {
    await app.close();
  });

  it('create event -> subscribes -> update event ->outbox processed -> notification log created', async () => {
    const creatorEmail = `creator_${Date.now()}@test.com`;
    const subscriberEmail = `subscriber_${Date.now()}@test.com`;
    const password = '123456';

    //register creator
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: creatorEmail, password })
      .expect(201);

    //login creator
    const creatorLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: creatorEmail, password })
      .expect(201);

    const creatorToken = creatorLoginRes.body.accessToken;
    expect(creatorToken).toBeDefined();

    //register subscriber
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: subscriberEmail, password })
      .expect(201);

    //login ubscriber
    const subscriberLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: subscriberEmail, password })
      .expect(201);

    const subscriberToken = subscriberLoginRes.body.accessToken;
    expect(subscriberToken).toBeDefined();


    //creator creates event
    const createEventRes = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        title: 'My event',
        description: 'Description event',
        startAt: new Date().toISOString(),
      })
      .expect(201);

    const eventId = createEventRes.body.id;
    expect(eventId).toBeDefined();

    //subscribe
    await request(app.getHttpServer())
      .post('/subscriptions')
      .set('Authorization', `Bearer ${subscriberToken}`)
      .send({ eventId })
      .expect(201);

    //update event -> outbox
    await request(app.getHttpServer())
      .patch(`/events/${eventId}`)
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        title: 'My updated event',
      })
      .expect(200);

    //проверяем, что outbox created
    const outboxBefore = await dataSource.getRepository(Outbox).find();
    expect(outboxBefore.length).toBe(1);
    expect(outboxBefore[0].status).toBe('PENDING');

    //вручную процессим outbox (вместо cron)
    const result = await outboxService.processPending(10);
    expect(result.processed).toBe(1);

      //ждем пока очередь обработает notifications job
      const logRepo = dataSource.getRepository(NotificationLog);
      let logs: NotificationLog[] = [];
      for (let i =0; i < 20; i++) {
        logs = await logRepo.find();
        if (logs.length === 1 && logs[0].status === 'sent') {
          break;
        }

        await new Promise((r) => setTimeout(r, 100));
      }

    //check NotificationsLog
    expect(logs.length).toBe(1);
    expect(logs[0].eventId).toBe(eventId);
    expect(logs[0].status).toBe('sent'); 
  });
});