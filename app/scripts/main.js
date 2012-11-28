function init() {
    var btapp = new Btapp();
    btapp.connect({
        product: 'SoShare'
    });

    //this is just to generate a bunch of torrent download peers
    var scraper = new window.shareMaps.Models.DhtScraper({
        btapp: btapp
    });

    var locator = new (window.shareMaps.Collections.PeerLocationResolver.extend({
        btapp: btapp
    }));

    var map = new window.shareMaps.Views.MapView({
        model: locator
    });
    map.render();
    var clients = new window.shareMaps.Views.ClientsView({
        model: locator
    });
    $('.container').append(clients.render().el);

    window.btapp = btapp;
}

window.shareMaps = {
    Models: {},
    Collections: {},
    Views: {},
    Routers: {},
    init: init
};