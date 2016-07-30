var values = msg.payload.split('&');
var calendar = values[0].split('=')[1];
var events = values[1].replace('events=', '');

if(context.global.rooms === undefined) {
   context.global.rooms = {};
}

var room = context.global.rooms[calendar];

if (room === undefined) {
    room = {};
    room['events'] = '';
    room['lastUpdate'] = new Date();
    
    context.global.rooms[calendar] = room;
}

var params = '';
var event = '';
var host = '';
var lines = events.split(',');

room.events = '';
for(var index in lines) {
    params = lines[index].split('###');
    event = params[0];
    host = params[1].toLowerCase();
    
    if (host.search('Secret name') != -1) {
        host = ' Secret user';
    } else {
        host = ' User';
    }
    
    var hostArg = params[1].toLowerCase()
    if (hostArg.search('daily') != -1) {
        host += ', daily';

    } else if (hostArg.search('sprint') != -1) {
        host += ', sprint';

    } else if (hostArg.search('review') != -1) {
        host += ', review';
        
    } else if (hostArg.search('planning') != -1) {
        host += ', planning';
        
    } else if (hostArg.search('meeting') != -1) {
        host += ', meeting';
    }
    
    room.events += event + '  -  ' + host + '\n';
}

return room.events;
