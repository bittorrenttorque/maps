shareMaps.Models.DhtScraper = Backbone.Model.extend({
    initialize: function() {
        console.log('DhtScraper::initialize')
        _.bindAll(this, 'on_info_hash', 'on_torrent_metadata');
        this.get('btapp').live('dht', this.on_dht, this);
    },
    on_dht: function() {
        console.log('DhtScraper::on_dht');
        this.get('btapp').die('dht', this.on_dht, this);
        this.get('btapp').get('dht').get_any_hash(this.on_info_hash);
    },
    on_info_hash: function(info_hash) {
        console.log('DhtScraper::on_info_hash', info_hash);
        var magnet_link = 'magnet:?xt=urn:btih:' + info_hash;
        var req = this.get('btapp').resolve_torrent_metadata(magnet_link);
        req.then(this.on_torrent_metadata);
    },
    on_torrent_metadata: function(torrent) {
        console.log('DhtScraper::on_torrent_metadata', torrent);
        torrent.remove();
    }
});

var API_KEY = '3f3b0c86842ef997add6cabe908886ae65b242986c52859a91fd4a119bc04881';
var IP_LOCATION_API_URL = 'http://api.ipinfodb.com/v3/ip-city/';

var ip_location_lookup = _.memoize(function(ip) {
    var req = jQuery.ajax({
        url: IP_LOCATION_API_URL,
        data: {
            key: API_KEY,
            ip: ip,
            format: 'json'
        },
        dataType: 'jsonp'
    });
    return req;
});

shareMaps.Models.Peer = Backbone.Model.extend({
    initialize: function() {
        console.log('Peer::initialize');
        _.bindAll(this, 'on_metadata');
        console.log('Peer::initialize');
        this.get('torrent').live('file *', this.on_file, this);
    },
    on_file: function() {
        console.log('Peer::on_file');
        this.get('torrent').die('file *', this.on_file, this);
        this.get('torrent').get_metadata().then(this.on_metadata);
    },
    on_metadata: function(metadata) {
        console.log('Peer::on_metadata', metadata);
    }
});