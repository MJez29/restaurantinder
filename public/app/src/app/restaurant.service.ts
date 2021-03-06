import { Injectable } from '@angular/core';
import { Restaurant } from "./restaurant";
import { Preferences } from "./preferences";
import { Router } from "@angular/router";
import { Http, Response, Headers, RequestOptions, URLSearchParams, QueryEncoder } from "@angular/http";
import { ServerStatus } from "./server-status";
import { environment } from "../environments/environment";

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

const REQUEST_OPTIONS = new RequestOptions({ headers: new Headers({ 'Content-Type': 'application/json' }) });

const BASE = "http://192.168.2.7:3000";
const POST_LOCATION_URL = BASE + "/go/";//"http://localhost:3000/go";
const GET_GEOCODE_URL = BASE + "/geocode";
const GET_RESTAURANT_URL = BASE + "/go/";//"http://localhost:3000/go/";
const POST_FEEDBACK_URL = BASE + "/go/";//"http://localhost:3000/go/";

@Injectable()
export class RestaurantService {

	//The current restaurant
	private cur: Restaurant;

	private key: number;

	private lat: number;
	private lng: number;

	private finalSuggestion: boolean;

	constructor(private http: Http, private router: Router) { 
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
	setLocation(options: { useLatLng: boolean, lat: number, lng: number, addr1: string, addr2: string, addr3: string }, success: () => void, error: (err) => void) {
		
		// If provided valid lat/lng
		if (options.useLatLng && (this.lat = options.lat) && (this.lng = options.lng)) {

			// Posts location to server and calls the appropriate callback when it gets a response
			this.postLocation(success, error);

		// If provided an address
		} else if (!options.useLatLng) {

			// Geocodes
			this.geocode(options.addr1, options.addr2, options.addr3, (lat: number, lng: number) => {
				this.router.navigateByUrl("/go/confirm-location", { skipLocationChange: true });
			}, error);
		}
		
		// // Checks to make sure that all required parameters are present
		// console.log(options);
		// if ((options.useLatLng && (this.lat = options.lat) && (this.lng = options.lng)) || (!options.useLatLng && options.addr1 && options.addr2)) {
		// 	this.http.post(POST_LOCATION_URL, options/*, REQUEST_OPTIONS*/)
		// 		.map(this.extractData)
		// 		.subscribe((data) => {
		// 			console.log("DATA FROM GET REQUEST:\n" + JSON.stringify(data, null, 4));
		// 			if (data.key != -1) {
		// 				this.key = data.key;

		// 				// If the user provided their position in the form of an address, 
		// 				// the request will return their position in lat/lng
		// 				if (data.lat)
		// 					this.lat = data.lat;
		// 				if (data.lng)
		// 					this.lng = data.lng;
		// 				success();
		// 			}
		// 			else {
		// 				error("");
		// 			}
		// 		}, (err) => {
		// 			console.log(err);
		// 			error(err);
		// 		});
		// }
	}

	// Sends an address to the server to be geocoded into lat/lng
	private geocode(addr1: string, addr2: string, addr3: string, success: (lat: number, lng: number) => void, error: (e) => void) {
		let reqOpts = new RequestOptions({ headers: new Headers({ "Content-Type": "application/json" })});
		let urlParams = new URLSearchParams("", new QueryEncoder());
		urlParams.append("addr1", addr1);
		urlParams.append("addr2", addr2);
		urlParams.append("addr3", addr3);
		reqOpts.params = urlParams;
		console.log(reqOpts);
		this.http.get(`${ environment.baseUrl }/geocode`, reqOpts)
			.map(this.extractData)
			.subscribe((data) => {
				if (data.status === ServerStatus.OK) {
					console.log(data);
					this.lat = data.lat;
					this.lng = data.lng;
					success(data.lat, data.lng);
				} else {
					error(data.status);
				}
			}, (err) => {
				error(err);
			});
	}

	// Posts the user's location to the server to create an instance of the suggestion app
	// In return, receives an access key from the server
	public postLocation(success: () => void, error: (err) => void) {
		console.log(`LAT: ${this.lat}, LNG: ${this.lng}`);
		this.http.post(`${environment.baseUrl}/go`, { lat: this.lat, lng: this.lng })
			.map(this.extractData)
			.subscribe((data) => {
				console.log("DATA FROM GET REQUEST:\n" + JSON.stringify(data, null, 4));
				// TODO: Check status
				if (data.status === "OK") {
					this.key = data.key;

					success();
				}
				else {
					error(data.status);
				}
			}, (err) => {
				console.log(err);
				error(err);
			});
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
			value: string,			//The category alias
			pref: string			//"GOOD", "BAD", "NEUTRAL"
		}[]
	}, success: () => void) {
		this.http.post(`${ environment.baseUrl }/go/${ this.key }`, prefs)
			.map(this.extractData)
			.subscribe((data) => {
				if (data.status === ServerStatus.OK) {
					success();
				} else {
					console.log(data.status);
				}
			}, (err) => {

			})
	}

	getCurrentRestaurant(): Restaurant {
		return this.cur;
	}

	getNewRestaurant(success: (restaurant: Restaurant) => void, error: (any) => void): void {
		this.http.get(`${ environment.baseUrl }/go/${ this.key }`)
			.map(this.extractData)
			.subscribe((data) => {
				if (data.status === ServerStatus.ACTIVE_SUGGESTION) {
					console.log(JSON.stringify(data, null, 4));
					this.cur = new Restaurant(data.suggestion);
					success(this.cur);
				} else if (data.status === ServerStatus.INACTIVE_SUGGESTION) {
					this.finalSuggestion = true;
					console.log(JSON.stringify(data, null, 4));
					this.cur = new Restaurant(data.suggestion);
					this.router.navigateByUrl("/go/more-info", { skipLocationChange: true });
				} else {
					error(data.status);
				}
			}, error);
	}

	public getReviewCount() {
		return this.cur.getReviewCount();
	}

	public isFinalSuggestion() {
		return this.finalSuggestion;
	}

	//private sendFeedback(fb: feedback): Observable<

	private extractData(res: Response) {
		return res.json() || {};
	}
}
