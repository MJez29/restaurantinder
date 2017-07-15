import { Component, OnInit } from '@angular/core';
import { Restaurant } from "../restaurant";
import { RestaurantService } from "../restaurant.service";

@Component({
  selector: 'app-suggestion',
  templateUrl: './suggestion.component.html',
  styleUrls: ['./suggestion.component.css']
})
export class SuggestionComponent implements OnInit {

  constructor(private restaurantService: RestaurantService) { }

  ngOnInit() {
  }

}
