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

	constructor(data) {
		this.categories = data.categories;
		this.coordinates = data.coordinates;
		this.display_phone = data.display_phone;
		this.distance = data.distance;
		this.id = data.id;
		this.image_url = data.image_url;
		this.is_closed = data.is_closed;
		this.location = data.location;
		this.name = data.name;
		this.phone = data.phone;
		this.price = data.price;
		this.rating = data.rating;
		this.review_count = data.review_count;
		this.transactions = data.transactions;
		this.url = data.url;
	}

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

	public getCategories() {
		return this.categories;
	}

	public getDistance() {
		return this.distance;
	}
}