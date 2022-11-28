import { ForceGraph, GraphLink, GraphNode, GraphOptions } from 'graph-viz-core';
import { Processor } from 'bullmq';
import * as dotenv from "dotenv"
import { env } from "process";
import { StorageClient } from '@supabase/storage-js';

dotenv.config();


const STORAGE_URL = `https://${env.SUPABASE_REF}.supabase.co/storage/v1`
const SERVICE_KEY = String(env.SUPABASE_SERVICE_KEY);
const BUCKET = String(env.SUPABASE_STORAGE_BUCKET);

const storageClient = new StorageClient(STORAGE_URL, {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
})


type WorkerDataType = { inputFile: string; options: GraphOptions };

const processor: Processor<WorkerDataType, void, string> = async (job) => {
  job.data.options.store = async (buffer: Buffer, slug: string) => {
    await storageClient.from(BUCKET).upload(job.id + "/" + slug, buffer);
  }
  const { data, error } = await storageClient.from("@graphviz-inputs").download(job.data.inputFile)
  if (error) throw error;

  const parsed = JSON.parse(await data.text());
  const nodes = <GraphNode[]>parsed.nodes;
  const links = <GraphLink[]>parsed.links;
  const graph = new ForceGraph(Array.from(nodes.values()), links, job.data.options);



  graph.on('progress', (e) => {
    job.updateProgress(e);
  });

  return await graph.generateTiles();
};

export default processor;
