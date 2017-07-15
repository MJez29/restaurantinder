import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { HttpModule, JsonpModule } from "@angular/http";

import { AppComponent } from './app.component';
import { GetLocationComponent } from './get-location/get-location.component';
import { SuggestionComponent } from "./suggestion/suggestion.component"

import { RestaurantService } from "./restaurant.service";

@NgModule({
	declarations: [
		AppComponent,
		GetLocationComponent,
		SuggestionComponent
	],
	imports: [
		BrowserModule,
		HttpModule,
		JsonpModule,
		RouterModule.forRoot([
			{
				path: "",
				redirectTo: "/go",
				pathMatch: "full"
			},
			{
				path: "go",
				component: GetLocationComponent
			},
			{
				path: "go/suggest",
				component: SuggestionComponent
			}
		])
	],
	providers: [
		RestaurantService
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
