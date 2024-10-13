import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'amenityName',
  standalone: true, 
})
export class AmenityNamePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;
    return value
      .replace(/_/g, ' ') // replace '_' with space
      .toLowerCase()
      .replace(/(^|\s)\S/g, (match) => match.toUpperCase()); 
  }
}
