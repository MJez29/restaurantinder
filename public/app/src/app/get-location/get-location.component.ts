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
	addr3: string;
	addrSub: boolean;

	time = Date.now();

	geolocationErr: boolean;
	latLngErr: boolean;
	addrErr: boolean;

	constructor(private restaurantService: RestaurantService, private router: Router) { 
		this.geolocationErr = this.latLngErr = this.addrErr = false;
	}

	ngOnInit() {
	}

	//Gets the user's geolocation
	getGeolocation() {
		navigator.geolocation.getCurrentPosition((pos) => {
			this.lat = pos.coords.latitude;
			this.lng = pos.coords.longitude;
			console.log(this.lat + "   " + this.lng);

			this.startSuggesting(true);
		}, (err) => {
			console.log(err);
			this.geolocationErr = true;
		})
	}

	//Validates input and then starts suggestion app
	submitLatLng(lat: HTMLInputElement, lng: HTMLInputElement) {

		//Converts the inputs to numbers
		let nlat: number = Number.parseFloat(lat.value);
		let nlng: number = Number.parseFloat(lng.value);

		//If the user entered a valid position
		//Handles non-numeric characters as well
		if (Math.abs(nlat) <= 90 && Math.abs(nlng) <= 180) {
			this.lat = nlat;
			this.lng = nlng;
			this.startSuggesting(true);
		}
		else {
			//Displays error message to the user and resets input boxes
			this.latLngErr = true;
			lat.value = null;
			lng.value = null;
		}
	}

	submitAddr(addr1: HTMLInputElement, addr2: HTMLInputElement, addr3: HTMLInputElement) {
		this.addr1 = addr1.value;
		this.addr2 = addr2.value;
		this.addr3 = addr3.value;
		this.startSuggesting(false);
	}

	//Sends the user's location to the RestaurantService and redirects to begin the actual app and show the user a suggestion
	private startSuggesting(useLatLng) {
		this.restaurantService.setLocation({
			useLatLng: useLatLng,
			lat: this.lat,
			lng: this.lng,
			addr1: this.addr1,
			addr2: this.addr2,
			addr3: this.addr3
		}, () => {
			this.router.navigateByUrl("/go/suggest", { skipLocationChange: true });
		}, (err) => {
			this.addrErr = true;
		});
	}
}
