import { ForceGraph, GraphLink, GraphNode, GraphOptions } from '@graph-viz/core';
import { Processor } from 'bullmq';
import * as fs from 'fs';

function cleanUpDir(path: string, zoomLevels: number) {
  if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true, force: true });
  }

  fs.mkdirSync(`${path}/tiles`, { recursive: true });

  for (let i = 0; i < zoomLevels; i++) {
    fs.mkdirSync(`${path}/tiles/${i + 1}`);
  }
}

type WorkerDataType = { inputFile: string; options: GraphOptions };

const processor: Processor<WorkerDataType, void, string> = async (job) => {
  let options = job.data.options;

  if (options)
    options.path = String(options.path).endsWith('/')
      ? options.path + job.id
      : `${options.path}/${job.id}`;

  const parsed = JSON.parse(fs.readFileSync(job.data.inputFile).toString());
  const nodes = <GraphNode[]>parsed.nodes;
  const links = <GraphLink[]>parsed.links;
  const graph = new ForceGraph(Array.from(nodes.values()), links, options);

  cleanUpDir(options.path, options.zoomLevels);

  graph.on('progress', (e) => {
    job.updateProgress(e);
  });

  return await graph.generateTiles();
};

export default processor;
