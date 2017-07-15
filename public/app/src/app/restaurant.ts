export class Restaurant {
	private categories: [
		{
			title: string,
			alias: string
		}
	];

	private coordinates: {
		latitude: number,
		longitude: number
	};

	private display_phone: string;

	private distance: number;

	private id: string;

	private image_url: string;

	private is_closed: boolean;

	private location: {
		address1: string,
		address2: string,
		address3: string,
		city: string,
		country: string,
		display_address: string[],
		state: string,
		zip_code: string
	};

	private name: string;

	private phone: string;

	private price: string;

	private rating: number;

	private review_count: number;

	private url: string;

	private transactions: string[];

	//Getters

	public getName() {
		return this.name;
	}

	public getImageUrl() {
		return this.image_url;
	}

	public getPrice() {
		return this.price;
	}
}