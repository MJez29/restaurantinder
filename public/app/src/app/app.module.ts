import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { HttpModule, JsonpModule } from "@angular/http";

import { AppComponent } from './app.component';
import { GetLocationComponent } from './get-location/get-location.component';
import { SuggestionComponent } from "./suggestion/suggestion.component"

import { RestaurantService } from "./restaurant.service";
import { RoundPipe } from './round.pipe';
import { MoreInfoComponent } from './more-info/more-info.component';

import { AgmCoreModule } from "@agm/core";
import { HomeComponent } from './home/home.component';
import { ConfirmLocationComponent } from './confirm-location/confirm-location.component';

@NgModule({
	declarations: [
		AppComponent,
		GetLocationComponent,
		SuggestionComponent,
		RoundPipe,
		MoreInfoComponent,
		HomeComponent,
		ConfirmLocationComponent
	],
	imports: [
		BrowserModule,
		HttpModule,
		JsonpModule,
		RouterModule.forRoot([
			{
				path: "",
				component: HomeComponent
			},
			{
				path: "go",
				component: GetLocationComponent
			},
			{
				path: "go/suggest",
				component: SuggestionComponent
			},
			{
				path: "go/more-info",
				component: MoreInfoComponent
			}
		]),
		AgmCoreModule.forRoot({
			apiKey: "AIzaSyBk9aL8r8Ss9hRDYI8MTR5u9eRPZRBgpdE"
		})
	],
	providers: [
		RestaurantService
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
