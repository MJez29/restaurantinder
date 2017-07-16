import { Pipe, PipeTransform } from '@angular/core';

//Rounds a given number
//If the 

@Pipe({
	name: 'round'
})
export class RoundPipe implements PipeTransform {

	transform(value: number, len: number): string | number {
		if (!Number.isInteger(len) || len < 0)
			return value;

		return value.toFixed(len);
	}

}
