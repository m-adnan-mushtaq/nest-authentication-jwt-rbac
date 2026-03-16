import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

@Injectable()
export class StringValidationPipe implements PipeTransform {
  transform(value: any) {
    if (typeof value !== 'string') {
      throw new BadRequestException('Value must be a string');
    }

    if (value.trim() === '') {
      throw new BadRequestException('String must not be empty');
    }

    return value.trim(); // Optionally return the trimmed string
  }
}
