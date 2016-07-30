/**
 * My API Sandbox
 * 
 */

var currentWeather = "Ocorreu alguma falha no sistema, favor tente mais tarde! - Husky";
var currentRoons = "Esse comando ainda está em construção! - Husky";
var rooms;

Sandbox.define('/weather', 'POST', function(req, res){
    // Check the request, make sure it is a compatible type
    if (!req.is('application/json')) {
        return res.send(400, 'Invalid content type, expected application/json');
    }
    
    currentWeather = req.body.text;

    res.type('application/json');
    res.status(200);
    res.json({
        "status": "ok"
    });
})

Sandbox.define('/currentWeather','GET', function(req, res) {
    
    res.type('application/json');
    res.status(200);
    res.json({
        "text" : currentWeather
    });
    
})

Sandbox.define('/library','GET', function(req, res) {
    
    res.type('application/json');
    res.status(200);
    res.json({
        "text" : new Date()
    });
    
})

Sandbox.define('/noise','GET', function(req, res) {
    
    res.type('application/json');
    res.status(200);
    res.json({
        "text" : rooms
    });
})

Sandbox.define('/rooms','POST', function(req, res) {
    
    res.type('application/json');
    res.status(200);
    rooms = req.body.rooms;
    res.json({
        "text" : rooms
    });
    
    for(var key in rooms){
        loadScheduled(rooms[key]);
    }
    
})

Sandbox.define('/schedule','POST', function(req, res) {
    
    res.type('application/json');
    res.status(200);
    
    res.json({
        "text" : loadEvents(req.body.text)
    });
    
})

function loadEvents(name) {
    name = name.toLowerCase();
    name = name.charAt(0).toUpperCase() + name.slice(1);
    if (rooms[name] !== undefined) {
        return 'Sala: *' + name + '* \n'+rooms[name].events;
    } else {
        return 'rooms.name.events';   
    }
}

function loadScheduled(object) {
    object.scheduled = {};
    object.indexKey = {};
    object.keyIndex = {};
    var indexKey = 0;
    for (var hour = 0; hour < 24; hour++) {
	    indexKey ++;
	    for (var interval = 0; interval < 2; interval++) {
		    indexKey ++;
		    sufix = (interval == 0) ? ':00' : ':30';
            hour = ((''+hour).length == 1) ? '0'+hour : hour;
            object.indexKey[indexKey] = (hour + sufix);
            object.keyIndex[(hour + sufix)] = indexKey;
	    }  
    }

    for (var index in object.schedules) {
	    var event = object.schedules[index];
	    var eventStart = event.split('–')[0].trim();
	    var eventEnd = event.split('–')[1].trim();
        var hour = '';
        var minute = '';

        hour = eventStart.split(':')[0];
        minute = eventStart.split(':')[1] < 30 ? ':00' : ':30';
        eventStart = hour + minute;

        hour = eventEnd.split(':')[0];
        minute = eventEnd.split(':')[1] < 30 ? ':00' : ':30';
        eventEnd = hour + minute;

	    for ( var i = object.keyIndex[eventStart]; i <= object.keyIndex[eventEnd]; i++) {
	        if (object.indexKey[i] != undefined) {
	            object.scheduled[ object.indexKey[i] ] = true;   
	        }
	    }

    }
    
    object.indexKey = {};
    object.keyIndex = {};

}
