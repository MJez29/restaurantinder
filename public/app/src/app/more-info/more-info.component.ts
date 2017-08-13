import { Component, OnInit } from '@angular/core';
import { RestaurantService } from "../restaurant.service";
import { Restaurant } from "../restaurant";
import { Router } from "@angular/router";

@Component({
	selector: 'app-more-info',
	templateUrl: './more-info.component.html',
	styleUrls: ['./more-info.component.css']
})
export class MoreInfoComponent implements OnInit {

	public loading: boolean;
	public restaurant: Restaurant;
	public lat: number;
	public lng: number;
	public isFinalSuggestion: boolean;

	constructor(private restaurantService: RestaurantService, private router: Router) { 
		this.loading = true;
	}

	ngOnInit() {
		this.restaurant = this.restaurantService.getCurrentRestaurant();
		this.lat = this.restaurantService.getLat();
		this.lng = this.restaurantService.getLng();
		console.log(`${this.lat}, ${this.lng}`);
		this.loading = false;

		// TODO: Implement this
		// this.isFinalSuggestion = this.restaurantService.isFinalSuggestion();
	}

}
