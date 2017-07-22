import { Component, OnInit } from '@angular/core';
import { Restaurant } from "../restaurant";
import { RestaurantService } from "../restaurant.service";
import { Router } from "@angular/router";

//After 10s the app moves on to the next suggestion
const SUGGESTION_DURATION = 10 * 1000;

@Component({
	selector: 'app-suggestion',
	templateUrl: './suggestion.component.html',
	styleUrls: ['./suggestion.component.css']
})
export class SuggestionComponent implements OnInit {
	readonly GOOD = "GOOD";
	readonly NEUTRAL = "NEUTRAL";
	readonly BAD = "BAD";

	public restaurant: Restaurant;

	public loading: boolean;

	private pricePref: string;
	private distancePref: string;
	private categoryPrefs: string[];

	private timer;

	constructor(private restaurantService: RestaurantService, private router: Router) { 
		this.loading = true;
	}

	ngOnInit() {

		//Scrolls view back to top
		window.scrollTo(0, 0);

		//Gets a new restaurant to show
		this.restaurantService.getNewRestaurant((res: Restaurant) => {
			this.restaurant = res;

			//Done loading
			this.loading = false;

			this.pricePref = this.NEUTRAL;
			this.distancePref = this.NEUTRAL;
			this.categoryPrefs = [];
			let n = res.getNumCategories()
			for (let i = 0; i < n; i++) {
				this.categoryPrefs.push(this.NEUTRAL);
			}

			this.timer = setTimeout(() => { this.nextSuggestion() }, SUGGESTION_DURATION);
		}, (err) => {
			console.log(err);
		})
	}

	moreInfo() {
		clearTimeout(this.timer);
		this.router.navigateByUrl("/go/more-info", { skipLocationChange: true });
	}

	//Registers a button click for the shown price
	//The buttons work as toggles
	priceClick(click: string) : void {
		if (this.pricePref !== click) {
			this.pricePref = click;
		}
		else {
			this.pricePref = this.NEUTRAL;
		}
	}

	distanceClick(click: string) : void {
		if (this.distancePref !== click) {
			this.distancePref = click;
		}
		else {
			this.distancePref = this.NEUTRAL;
		}
	}

	categoryClick(click: string, index: number) : void {
		if (this.categoryPrefs[index] !== click) {
			this.categoryPrefs[index] = click;
		}
		else {
			this.categoryPrefs[index] = this.NEUTRAL;
		}
	}

	nextSuggestion() {
		console.log("TIMER");
		//Stops the countdown timer in case it hasn't gone off yet
		clearTimeout(this.timer);

		//Sends the preferences gathered to the server 
		this.restaurantService.sendPreferences({
			price: {
				value: this.restaurant.getPrice(),
				pref: this.pricePref
			},
			distance: {
				value: this.restaurant.getDistance(),
				pref: this.distancePref
			},
			categories: (() => {
				//Creates an array of the category preferences

				let arr: { value: string, pref: string }[] = [];

				let cats = this.restaurant.getCategories();

				let n = this.restaurant.getNumCategories();
				for (let i = 0; i < n; i++) {
					arr.push({
						value: cats[i].title,
						pref: this.categoryPrefs[i]
					});
				}

				return arr;
			}) ()
		}, () => {
			this.ngOnInit();
		})
	}
}