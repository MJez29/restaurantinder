import { RestaurantinderWebAppPage } from './app.po';

describe('restaurantinder-web-app App', () => {
  let page: RestaurantinderWebAppPage;

  beforeEach(() => {
    page = new RestaurantinderWebAppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
