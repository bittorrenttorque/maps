function getShortClientName(name) {
    var matches = name.match(/.[a-zA-Z]+/);
    return matches ? matches[0] : '';
}

function getClientColor(name) {
    var hash = CryptoJS.MD5(name).toString();
    var color = hash.substr(0, 6);
    return color;
}

shareMaps.Views.MapView = Backbone.View.extend({
    initialize: function() {
        console.log('MapView::initialize');
        this.overlays = {};
        this.model.on('add', this.on_add, this);
        this.model.on('remove', this.on_remove, this);
    },
    create_marker: function(peer, width, height, color, tooltip) {
        var point = new GLatLng(peer.get('latitude'), peer.get('longitude'));
        var icon = new GIcon();
        var icon = MapIconMaker.createMarkerIcon({width: width, height: height, primaryColor: '#' + color, cornercolor: '#' + color});
        var marker = new GMarker(point, {title: tooltip, icon: icon});
        this.map.addOverlay(marker);
        return marker;
    },
    on_add: function(peer) {
        console.log('MapView::on_add', peer);
        var tooltip = JSON.stringify(peer.get('peer').get('properties').toJSON(), null, 4);
        var name = peer.get('peer').get('properties').get('client');
        name = getShortClientName(name);
        var color = getClientColor(name);
        var marker = this.create_marker(peer, 20, 34, color, tooltip);
        this.overlays[peer.id] = marker;
    },
    on_remove: function(peer) {
        console.log('MapView::on_remove', peer);
        this.map.removeOverlay(this.overlays[peer.id]);
        delete this.overlays[peer.id];
    },
    render: function() {
        console.log('MapView::render');
        var map = new GMap2(document.getElementById("map"));
        map.addControl(new GSmallMapControl());
        this.map = map;
        map.setCenter(new GLatLng(0, 0), 2);
        this.model.each(this.on_add, this);
        return this;
    }
});

shareMaps.Views.ClientsView = Backbone.View.extend({
    initialize: function() {
        this.model.on('add', this.render, this);
        this.model.on('remove', this.render, this);
        this.template = _.template($('#clients_template').html());
    },
    render: function() {
        var clients = this.model.map(function(model) { 
            return model.get('peer').get('properties').get('client');
        });
        clients = _.compact(clients);
        clients = _.map(clients, getShortClientName);
        clients = _.uniq(clients);
        clients = _.sortBy(clients, function(client) { return client.toUpperCase(); });

        clients = _.map(clients, function(client) { 
            return { 
                name: client,
                color: getClientColor(client)
            };
        });

        this.$el.html(this.template({clients: clients}));
        return this;
    }
});