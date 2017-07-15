import { Injectable } from '@angular/core';
import { Restaurant } from "./restaurant";
import { Feedback } from "./feedback";
import { Http, Response, Headers, RequestOptions } from "@angular/http";

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

const REQUEST_OPTIONS = new RequestOptions({ headers: new Headers({ 'Content-Type': 'application/json' }) });

const POST_LOCATION_URL = "http://192.168.2.5:3000/go";

@Injectable()
export class RestaurantService {

	//The current restaurant
	cur: Restaurant;

	key: number;

	lat: number;
	lng: number;

	constructor(private http: Http) { }

	//Sets the location of the user
	setLocation(lat: number, lng: number, success: () => void, error: (err) => void) {
		this.lat = lat;
		this.lng = lng;
		this.http.post(POST_LOCATION_URL, { lat: this.lat, lng: this.lng }/*, REQUEST_OPTIONS*/)
			.map(this.extractData)
			.subscribe((data) => {
				this.key = data.key;
				success();
			}, (err) => {
				console.log(err);
				error(err);
			});
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
							return res.json().data || {};
						})
						.subscribe(success, error);
				},
				(err) => {
					console.log(err);
				}
			)
	}
	
	getNewRestaurant(fb: Feedback, success: (restaurant: Restaurant) => void, error: (any) => void): void {
		this.http.get(`192.168.2.5:3000/go/{this.id}`)
			.map((res: Response) => {
				return res.json().data || {};
			})
	}

	//private sendFeedback(fb: feedback): Observable<

	private extractData(res: Response) {
		return res.json().data || {};
	}
}
