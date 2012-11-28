Btapp.prototype.resolve_torrent_metadata = function(magnet_link) {
    var magnet_identifier = 'magnet:?xt=urn:btih:';
    if(magnet_link.indexOf(magnet_identifier) !== 0)
        throw 'malformed magnet link';

    var hash = magnet_link.substring(magnet_identifier.length).substr(0, 40);
    console.log(hash);
    if(!hash.match(/[a-zA-Z0-9]/))
        throw 'only support hex encoded info hashes';

    var ret = new jQuery.Deferred();
    var torrent_selector = 'torrent';
    var wait_for_torrent_handler = function(torrents) {
        this.die(torrent_selector, wait_for_torrent_handler, this);
        torrents.download({
            url: magnet_link,
            priority: Btapp.TORRENT.PRIORITY.METADATA_ONLY
        });

        var wait_for_resolved_torrents_files = function(torrent) {
            var file_selector = 'file';
            var wait_for_file_handler = function(files) {
                files.keys().then(function(file_names) {
                    var file_add_selector = 'add';
                    if(file_names.length === 0) 
                        throw 'bad file name list';
                    var check_files_list = function() {
                        if(file_names.length === files.length) {
                            files.off(file_add_selector, check_files_list);
                            ret.resolve(torrent);
                        }
                    };
                    files.on(file_add_selector, check_files_list);
                    check_files_list();
                });
                torrent.die(file_selector, wait_for_file_handler);
            };
            torrent.live(file_selector, wait_for_file_handler);
        };
        var properties_selector = hash + ' properties';
        var wait_for_torrent_properties_handler = function(properties, torrent) {
            torrents.die(properties_selector, wait_for_torrent_properties_handler);
            if(properties.get('metadata_resolved')) {
                wait_for_resolved_torrents_files(torrent);
            } else {
                var wait_for_resolved_torrents_files_handler = function() {
                    properties.off('change:metadata_resolved', wait_for_resolved_torrents_files_handler);
                    wait_for_resolved_torrents_files(torrent);
                };
                properties.on('change:metadata_resolved', wait_for_resolved_torrents_files_handler);
            }
        };
        torrents.live(properties_selector, wait_for_torrent_properties_handler);
    };

    this.live(torrent_selector, wait_for_torrent_handler, this);
    return ret;
};