import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ImageService {
  async getImage(image, generatePreview = false) {
    if (!image) {
      return null;
    }

    if (!generatePreview) {
      return image;
    }

    const { url, width, height } = image;

    const res = await axios.get(url.replaceAll('_V1_', '_UY16_'), {
      responseType: 'arraybuffer',
    });
    const buffer = res.data;
    return {
      preview: buffer.toString('base64'),
      url,
      width,
      height,
    };
  }
}
