import { CacheInterceptor, CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TitleModule } from './title/title.module';
import { ImageModule } from './image/image.module';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    TitleModule,
    ImageModule,
    CacheModule.register({
      ttl: 60 * 30, // seconds
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {}
