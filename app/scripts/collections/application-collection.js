shareMaps.Collections.PeerLocationResolver = Backbone.Collection.extend({
    model: shareMaps.Models.Peer,
    initialize: function() {
        console.log('PeerLocationResolver::initialize');
        this.lookups = {};
        this.btapp.live('torrent * peer *', this.on_add_peer, this);
    },
    on_add_peer: function(peer, peers, torrent) {
        console.log('PeerLocationResolver::on_add_peer', peer);
        var ip = peer.get('properties').get('ip');
        peer.on('destroy', _.bind(this.on_remove_peer, this, ip));
        var req = ip_location_lookup(ip);
        this.lookups[ip] = req;
        req.then(_.bind(this.on_location_lookup, this, ip, peer, torrent));
    },
    on_remove_peer: function(ip) {
        console.log('PeerLocationResolver::on_remove_peer', ip);
        if(ip in this.lookups) {
            this.lookups[ip].abort();
            delete this.lookups[ip];
        } else {
            this.remove(this.get(ip));
        }
    },
    on_location_lookup: function(ip, peer, torrent, res) {
        delete this.lookups[ip];
        console.log('PeerLocationResolver::on_location_lookup', ip, torrent, res);
        var model = new shareMaps.Models.Peer({
            id: ip,
            ip: ip,
            peer: peer,
            torrent: torrent,
            latitude: parseFloat(res.latitude),
            longitude: parseFloat(res.longitude)
        });
        this.add(model);
    }
});