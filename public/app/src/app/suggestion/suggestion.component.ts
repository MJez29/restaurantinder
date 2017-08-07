import { Component, OnInit } from '@angular/core';
import { Restaurant } from "../restaurant";
import { RestaurantService } from "../restaurant.service";
import { Router } from "@angular/router";

//After 10s the app moves on to the next suggestion
const SUGGESTION_DURATION = 100 * 1000;			//TODO: SET THIS BACK TO 10

@Component({
	selector: 'app-suggestion',
	templateUrl: './suggestion.component.html',
	styleUrls: ['./suggestion.component.css']
})
export class SuggestionComponent implements OnInit {
	readonly GOOD = "good";
	readonly NEUTRAL = "neutral";
	readonly BAD = "bad";

	public restaurant: Restaurant;

	public loading: boolean;

	public price: {
		value: string,
		pref: string
	};
	public distance: {
		value: number,
		pref: string
	};
	public categories: {
		title: string,
		alias: string,
		pref: string
	}[];

	private timer;

	constructor(private restaurantService: RestaurantService, private router: Router) { 
	}

	ngOnInit() {
		this.loading = true;

		//Scrolls view back to top
		window.scrollTo(0, 0);

		//Gets a new restaurant to show
		this.restaurantService.getNewRestaurant((res: Restaurant) => {
			this.restaurant = res;

			//Done loading
			this.loading = false;

			this.categories = res.getCategories();

			this.price = res.getPrice();

			this.distance = res.getDistance();


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
		if (this.price.pref !== click) {
			this.price.pref = click;
		}
		else {
			this.price.pref = this.NEUTRAL;
		}
	}

	distanceClick(click: string) : void {
		if (this.distance.pref !== click) {
			this.distance.pref = click;
		}
		else {
			this.distance.pref = this.NEUTRAL;
		}
	}

	categoryClick(click: string, index: number) : void {
		if (this.categories[index].pref !== click) {
			this.categories[index].pref = click;
		}
		else {
			this.categories[index].pref = this.NEUTRAL;
		}
	}

	nextSuggestion() {
		console.log("TIMER");
		//Stops the countdown timer in case it hasn't gone off yet
		clearTimeout(this.timer);

		//Sends the preferences gathered to the server 
		this.restaurantService.sendPreferences({
			price: this.price,
			distance: this.distance,
			categories: (() => {
				//Creates an array of the category preferences

				let arr: { value: string, pref: string }[] = [];
				for (let i = 0; i < this.categories.length; i++) {
					arr.push({
						value: this.categories[i].title,
						pref: this.categories[i].pref
					});
				}

				return arr;
			}) ()
		}, () => {
			this.ngOnInit();
		})
	}
}