import { URL } from 'url';
import * as puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

export class Crawler {
  private baseUrl: string;
  private mutableLinksToCrawl: string[];
  private crawledSet: Set<string>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.mutableLinksToCrawl = [];
    this.crawledSet = new Set();
  }

  public crawl() {
    (async () => {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      console.log(`Starting crawler on ${this.baseUrl}`);
      await this.crawlInternal(page, this.baseUrl);

      await browser.close();
    })();
  }

  private async crawlInternal(
    page: puppeteer.Page,
    path: string,
  ): Promise<void> {
    console.log(`Links to crawl: ${this.mutableLinksToCrawl.length}`);
    if (path === undefined) {
      console.log('Done crawling site');

      return Promise.resolve();
    }
    console.log(`Capturing ${path}`);
    await page.goto(path, { waitUntil: 'networkidle0' });
    const html = await page.content();
    const $ = cheerio.load(html);
    $('a').each((_, elem) => {
      const href = $(elem).attr('href');
      if (href.startsWith('/')) {
        const link = new URL(href, this.baseUrl).href;
        if (!this.crawledSet.has(link)) {
          console.log(`Adding link to set: ${link}`);
          this.crawledSet.add(link);
          this.mutableLinksToCrawl.push(link);
        }
      }
    });

    await this.crawlInternal(page, this.mutableLinksToCrawl.pop());
  }
}
