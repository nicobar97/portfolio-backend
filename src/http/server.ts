import { Configuration } from '../core/port/Configuration';
import appFactory from './app';

export default async (configuration: Configuration) => {
  try {
    const appInstance = await appFactory(configuration);
    await appInstance.listen({ port: configuration.server.port ?? 3001, host: '0.0.0.0' });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
