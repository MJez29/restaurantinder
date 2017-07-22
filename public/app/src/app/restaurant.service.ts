import { Injectable } from '@angular/core';
import { Restaurant } from "./restaurant";
import { Feedback } from "./feedback";
import { Http, Response, Headers, RequestOptions } from "@angular/http";

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

const REQUEST_OPTIONS = new RequestOptions({ headers: new Headers({ 'Content-Type': 'application/json' }) });

const POST_LOCATION_URL = "http://localhost:3000/go";
const GET_RESTAURANT_URL = "http://localhost:3000/go/";
const POST_FEEDBACK_URL = "http://localhost:3000/go/";

@Injectable()
export class RestaurantService {

	//The current restaurant
	private cur: Restaurant;

	private key: number;

	private lat: number;
	private lng: number;

	constructor(private http: Http) { 
		this.cur = new Restaurant({});
	}

	//Sets the location of the user
	// if (options.useLatLng)
		// options: {
		// 	useLatLng: boolean,
		// 	lat: number,
		// 	lng: number
		// }
	// else
		// options: {
		// 	useLatLng: boolean,
		// 	addr1: string,
		// 	addr2: string,
		// 	addr3: string (optional)
		// }
	setLocation(success: () => void, error: (err) => void, options: { useLatLng: boolean, lat: number, lng: number, addr1: string, addr2: string, addr3: string }) {
		//Checks to make sure that all required parameters are present
		console.log(options);
		if ((options.useLatLng && (this.lat = options.lat) && (this.lng = options.lng)) || (!options.useLatLng && options.addr1 && options.addr2)) {
			this.http.post(POST_LOCATION_URL, options/*, REQUEST_OPTIONS*/)
				.map(this.extractData)
				.subscribe((data) => {
					console.log("DATA FROM GET REQUEST:\n" + JSON.stringify(data, null, 4));
					if (data.key != -1) {
						this.key = data.key;

						// If the user provided their position in the form of an address, 
						// the request will return their position in lat/lng
						if (data.lat)
							this.lat = data.lat;
						if (data.lng)
							this.lng = data.lng;
						success();
					}
					else {
						error("");
					}
				}, (err) => {
					console.log(err);
					error(err);
				});
		}
	}

	// Returns the user's position

	getLat() {
		return this.lat;
	}

	getLng() {
		return this.lng;
	}

	sendPreferences(prefs: {
		price: {
			value: string,			//"$", "$$", "$$$", "$$$$"
			pref: string			//"GOOD", "BAD", "NEUTRAL"
		}, 
		distance: {
			value: number,			//The distance in meters
			pref: string			//"GOOD", "BAD", "NEUTRAL"
		},
		categories: {
			value: string,			//The category title
			pref: string			//"GOOD", "BAD", "NEUTRAL"
		}[]
	}, success: () => void) {
		this.http.post(POST_FEEDBACK_URL + this.key, prefs)
			.map(this.extractData)
			.subscribe((data) => {
				if (data.status === "OK") {
					success();
				}
			}, (err) => {

			})
	}

	getCurrentRestaurant(): Restaurant {
		return this.cur;
	}

	getFirstRestaurant(success: (restaurant: Restaurant) => void, error: (any) => void): void {

		this.http.post(`192.168.2.5:3000/go`, { lat: this.lat, lng: this.lng }, REQUEST_OPTIONS)
			.map(this.extractData)
			.subscribe(
				() => {
					this.http.get(`192.168.2.5:3000/go/{this.id}`)
						.map((res: Response) => {
							return res.json() || {};
						})
						.subscribe(success, error);
				},
				(err) => {
					console.log(err);
				}
			)
	}
	
	getNewRestaurantWithFeedback(fb: Feedback, success: (restaurant: Restaurant) => void, error: (any) => void): void {
		this.http.get(`192.168.2.5:3000/go/{this.id}`)
			.map((res: Response) => {
				return res.json().data || {};
			})
	}

	getNewRestaurant(success: (restaurant: Restaurant) => void, error: (any) => void): void {
		this.http.get(GET_RESTAURANT_URL + this.key)
			.map(this.extractData)
			.subscribe((restaurantData) => {
				console.log(JSON.stringify(restaurantData));
				this.cur = new Restaurant(restaurantData);
				success(this.cur);
			}, error);
	}

	//private sendFeedback(fb: feedback): Observable<

	private extractData(res: Response) {
		return res.json() || {};
	}
}
