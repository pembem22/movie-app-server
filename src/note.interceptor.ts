import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { data } from 'cheerio/lib/api/attributes';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { json } from 'stream/consumers';

@Injectable()
export class NoteInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => ({
      ...data, note: 'Information courtesy of IMDb (http://www.imdb.com). Used with permission.'
    })));
  }
}