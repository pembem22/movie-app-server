import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { gqlRequest } from './gql';
import { ImageService } from './image/image.service';
import cheerio from 'cheerio';

@Injectable()
export class AppService {
  constructor(private imageService: ImageService) {}

  async getTitleById(titleId: string) {
    const res = await gqlRequest(IMDB_TITLE_REQUEST, {
      itemId: titleId,
    });

    const data = res.title;

    const info_parts = [];
    if (data.genres) {
      info_parts.push(data.genres.genres.map((e) => e.text).join(', '));
    }
    if (data.releaseYear) {
      info_parts.push(data.releaseYear.year);
    }
    if (data.runtime) {
      info_parts.push(data.runtime.displayableProperty.value.plainText);
    }

    const images = await Promise.all(
      data.images.edges.map((e) =>
        (async (e) => await this.imageService.getImage(e.node, true))(e),
      ),
    );

    const starring = await Promise.all(
      data.credits.edges.map((e) =>
        (async () => ({
          id: e.node.name.id,
          name: e.node.name.nameText.text,
          photo: await this.imageService.getImage(e.node.name.primaryImage),
        }))(),
      ),
    );

    return {
      id: titleId,
      title: data.titleText.text,
      poster: await this.imageService.getImage(data.primaryImage, true),
      description: data.plot.plotText.plainText,
      info: info_parts.join(' | '),
      similar: data.moreLikeThisTitles.edges.map((e) => e.node.id),
      starring,
      images,
    };
  }

  async getPopularTitles(sort = 'rk,asc') {
    const res = await axios.get(
      `https://www.imdb.com/chart/moviemeter?sort=${sort}`,
    );
    const data = res.data;

    const $ = cheerio.load(data);

    const movieElements = $('tbody.lister-list').children();
    const moviesList = movieElements.toArray().map((movieElement) => {
      const IMDB_ID_REGEX = /([0-9]+)/;

      const url = $('td.titleColumn > a', movieElement).attr('href');
      return `tt${url.match(IMDB_ID_REGEX)[0]}`;
    });

    return moviesList;
  }

  async searchTitles(searchQuery: string) {
    try {
      const res = await axios.get(
        `https://v2.sg.media-imdb.com/suggestion/${searchQuery[0]}/${searchQuery}.json`,
      );
      const data = res.data;

      const IMDB_TITLE_REGEX = /(tt[0-9]+)/;

      const results = data.d
        .map((e) => e.id)
        .filter((e) => IMDB_TITLE_REGEX.test(e));

      return results;
    } catch (e) {
      return [];
    }
  }
}

const IMDB_TITLE_REQUEST = `
query($itemId: ID!) {
  title(id: $itemId) {
    id
    titleText {
      text
    }
    primaryImage {
      url
      width
      height
    }
    plot {
      plotText {
        plainText
      }
    }
    releaseYear {
      year
    }
    genres {
      genres {
        text
      }
    }
    credits(first: 4) {
      edges {
        node {
          name {
            id
            nameText {
              text
            }
            primaryImage {
              url
              width
              height
            }
          }
        }
      }
    }
    runtime {
      displayableProperty {
        value {
          plainText
        }
      }
    }
    moreLikeThisTitles(first: 10) {
      edges {
        node {
          id
        }
      }
    }
    images(first: 30) {
      edges {
        node {
          url
          width
          height
        }
      }
    }
  }
}`;
