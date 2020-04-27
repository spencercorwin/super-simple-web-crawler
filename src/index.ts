import { Crawler } from './crawler';
import * as program from 'commander';

program.option('-u, --url [url]', 'The URL to crawl').parse(process.argv);
const c = new Crawler(program.url);

c.crawl();
