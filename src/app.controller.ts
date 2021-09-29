import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { NoteInterceptor } from './note.interceptor';

const collections = new Map([
  ['0', { titles: ['tt1160419', 'tt6264654', 'tt9376612'] }],
  [
    '1000',
    {
      name: 'Netflix Originals',
      titles: [
        'tt5180504',
        'tt4574334',
        'tt1312171',
        'tt2085059',
        'tt5753856',
        'tt7550000',
        'tt1837492',
        'tt9561862',
        'tt5232792',
        'tt2261227',
      ],
    },
  ],
  [
    '1001',
    {
      name: 'Pirates of the Carribean',
      titles: ['tt0325980', 'tt0383574', 'tt0449088', 'tt1298650', 'tt1790809'],
    },
  ],
]);

@Controller('v1')
@UseInterceptors(NoteInterceptor)
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('search/:query')
  search(@Param('query') query: string) {
    return this.appService.searchTitles(query);
  }

  @Get('title/:id')
  async getTitleById(@Param('id') id: string) {
    return {
      recommended_collections: [`similar/${id}`],
      ...(await this.appService.getTitleById(id)),
    };
  }

  @Get('home')
  getHome() {
    return {
      featured_title: 'tt6723592',
      collections: [
        'general/recommended',
        'general/popular',
        'general/trending',
        'id/1000',
        'id/1001',
      ],
    };
  }

  @Get('collection/id/:id')
  getCollectionById(@Param('id') id: string) {
    return { id: `id/${id}`, ...collections.get(id) };
  }

  @Get('collection/similar/:id')
  async getSimilarCollection(@Param('id') id: string) {
    const title = await this.appService.getTitleById(id);
    return {
      id: `similar/${id}`,
      name: `Similar to ${title.title}`,
      titles: title.similar,
    };
  }

  @Get('collection/general/trending')
  async getTrendingCollection() {
    const titles = await this.appService.getPopularTitles();
    return { id: `general/trending`, name: 'Trending', titles: titles };
  }

  @Get('collection/general/popular') async getPopularCollection() {
    const titles = await this.appService.getPopularTitles('ir,desc');
    return { id: `general/popular`, name: 'Popular', titles: titles };
  }

  @Get('collection/general/recommended') async getRecommended() {
    return {
      id: `general/recommended`,
      name: 'Recommended for you',
      ...collections.get('0'),
    };
  }
}
