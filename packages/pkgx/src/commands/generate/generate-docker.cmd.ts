import { DockerGenerator } from '../../generators/docker/generator.js';

export async function generateDockerCommand() {
  const generator = new DockerGenerator();

  await generator.generate();
}
