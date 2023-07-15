import server from './server';
import { dotenvConfiguration } from '../adapter/config/DotenvConfiguration';
server(dotenvConfiguration);
