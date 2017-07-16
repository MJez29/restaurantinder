import { Component, OnInit } from '@angular/core';
import { Restaurant } from "../restaurant";
import { RestaurantService } from "../restaurant.service";

@Component({
	selector: 'app-suggestion',
	templateUrl: './suggestion.component.html',
	styleUrls: ['./suggestion.component.css']
})
export class SuggestionComponent implements OnInit {

	public restaurant: Restaurant;

	public loading: boolean;

	constructor(private restaurantService: RestaurantService) { 
		this.loading = true;
	}

	ngOnInit() {
		//Gets a new restaurant to show
		this.restaurantService.getNewRestaurant((res: Restaurant) => {
			this.restaurant = res;

			//Done loading
			this.loading = false;
		}, (err) => {
			console.log(err);
		})
	}

}
