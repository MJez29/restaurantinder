import { Component, OnInit } from '@angular/core';
import { RestaurantService } from "../restaurant.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-confirm-location',
  templateUrl: './confirm-location.component.html',
  styleUrls: ['./confirm-location.component.css']
})
export class ConfirmLocationComponent implements OnInit {

  public lat: number;
  public lng: number;

  constructor(private restaurantService: RestaurantService, private router: Router) { }

  ngOnInit() {
    this.lat = this.restaurantService.getLat();
    this.lng = this.restaurantService.getLng();
  }

  public locationConfirmed() {
    this.restaurantService.postLocation(() => {
      this.router.navigateByUrl("/go/suggest", { skipLocationChange: true })
      }, (err) => {
        console.log(err);
    });
  }

}
