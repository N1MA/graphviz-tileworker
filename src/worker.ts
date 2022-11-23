import { Worker } from 'bullmq';
import { env } from 'process';
import processor from './processor';
import * as dotenv from 'dotenv';

dotenv.config();

const connection = {
  host: env.REDIS_HOST!,
  port: Number(env.REDIS_PORT),
};

const worker = new Worker('graph-viz', processor, { connection });

worker.on('active', (job) => {
  console.info(`[STARTED] Job ID ${job.id} has been started`);
});

worker.on('completed', (job) => {
  console.info(`[COMPLETED] Job ID ${job.id} has been completed`);
});

worker.on('failed', (job) => {
  console.error(`[FAILED] Job ID ${job?.id}: ${job?.failedReason}`);
});

worker.on('drained', function () {
  console.info(`[WAITING] Waiting for jobs...`);
});
