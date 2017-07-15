import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

import { RestaurantService } from "../restaurant.service";

@Component({
	selector: 'app-get-location',
	templateUrl: './get-location.component.html',
	styleUrls: ['./get-location.component.css']
})
export class GetLocationComponent implements OnInit {
	locSub: boolean;

	lat: number;
	lng: number;
	latLngSub: boolean;

	addr1: string;
	addr2: string;
	addrSub: boolean;

	time = Date.now();

	constructor(private restaurantService: RestaurantService, private router: Router) { }

	ngOnInit() {
	}

	//Gets the user's geolocation
	getGeolocation() {
		navigator.geolocation.getCurrentPosition((pos) => {
			this.lat = pos.coords.latitude;
			this.lng = pos.coords.longitude;
			console.log(this.lat + "   " + this.lng);

			this.startSuggesting();
		}, (err) => {
			console.log(err);
		})
	}

	//Sends the user's location to the RestaurantService and redirects to begin the actual app and show the user a suggestion
	private startSuggesting() {
		this.restaurantService.setLocation(this.lat, this.lng, () => {
			this.router.navigateByUrl("/go/suggest", { skipLocationChange: true });
		}, (err) => {} );
	}
}
