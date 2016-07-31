/**
 * My API Sandbox
 * 
 */

var currentWeather = "Ocorreu alguma falha no sistema, favor tente mais tarde! - Husky";
var currentRoons = "Esse comando ainda está em construção! - Husky";
state.rooms = state.rooms || [];

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
        "text" : (new Date()).getHours() + ' ' + (new Date()).getMinutes()
    });
})

Sandbox.define('/schedules','POST', function(req, res) {
    
    res.type('application/json');
    res.status(200);
    _.merge(state.rooms, req.body.rooms);
    res.json({
        "text" : 'ok'
    });
    
    for(var key in state.rooms){
        loadScheduled(state.rooms[key]);
    }
    
})

Sandbox.define('/rooms','POST', function(req, res) {
    
    res.type('application/json');
    res.status(200);
    res.json(loadCalendars(req.body.text))
    
})

Sandbox.define('/room','POST', function(req, res) {
    
    res.type('application/json');
    res.status(200);
    res.json(loadEvents(req.body.text))
    
})

function loadCalendars(hour){
    var hour = (new Date()).getHours() + 1 ;
    hour = ((''+hour).length == 1)? '0' + hour : hour;
    
    var min = (new Date()).getMinutes();
    min = (min < 30) ? '00' : '30';
    
    var key2;
    var key3;
    var key4;
    
    // 08:00 | 08:30
    var key1 = hour + ':' + min;
    key1 = (key1.length == 4) ? '0' + key1 : key1;
    
    // 08:30 | 09:00
    if(min == '00') {
        key2 = hour + ':30';
    } else {
        key2 = (hour+1) + ':00';
    }
    key2 = (key2.length == 4) ? '0' + key2 : key2;
    
    // 09:00 | 09:30
    if(min == '00') {
        key3 = (hour+1) + ':00';
    } else {
        key3 = (hour+1) + ':30';
    }
    key3 = (key3.length == 4) ? '0' + key3 : key3;
    
    // 09:30 | 10:00
    if(min == '00') {
        key4 = (hour+1) + ':30';
    } else {
        key4 = (hour+2) + ':00';
    }
    key4 = (key4.length == 4) ? '0' + key4 : key4;
    
    var text = '';
    var line = '';
    var slash = ' | ';
    
    for(var key in state.rooms) {
        line += getLink(key, key1);
        line += slash + getLink(key, key2);
        line += slash + getLink(key, key3);
        line += slash + getLink(key, key4);
        line += slash + key + '\n';
    }
    
    return {
        "text" : line
    }
}

function getLink(key, time) {
    
    if (state.rooms[key].scheduled[time] === true) {
        return ('~' + time +'~');
    }
    
    var date = new Date();
    var dateParam = date.getFullYear();
    dateParam += (('' + date.getMonth()).length == 1) ? '0' + (1 + date.getMonth()) : (1 + date.getMonth());
    dateParam += (('' + date.getDate()).length == 1) ? '0' + date.getDate() : date.getDate();
    dateParam += 'T';
    
    //033000Z
    var hour = time.split(':')[0];
    hour = ((++hour) + 2);
    var nextHour = hour;
    hour = (('' + hour).length ==1) ? '0' + hour : hour;
    
    var min = time.split(':')[1];
    var nextMin = min;
    
    if (min == '00') {
        nextMin = '30';
    } else {
        nextHour++;
        nextMin = '00';
        nextHour = (('' + nextHour).length ==1) ? '0' + nextHour : nextHour;    
    }
    
    var firstDateParam = dateParam + hour + min + '00Z';
    var lastDateParam = dateParam + nextHour + nextMin + '00Z';
    
    dateParam = firstDateParam + '/' + lastDateParam;
    
    var linkPrefix = 'https://calendar.google.com/calendar/b/1/render?action=TEMPLATE&dates=';
    var linkSufix = '&sf=true&output=xml#eventpage_6';
    // 20161206T050000Z/20161208T060000Z
    
    return ( '<' + linkPrefix + dateParam + linkSufix + '|' + time + '>');

}

function loadEvents(name) {
    name = name.toLowerCase();
    
    var roomName;
    for(var key in state.rooms) {
        if (key.toLowerCase().search(name) != -1) {
            roomName = key;
        }
    }
    
    if (name.length != 0 && state.rooms[roomName] !== undefined) {
        return {
	        "text" : '*Sala: ' + roomName + '*',
            "attachments": [{
            "text": state.rooms[roomName].events
            }]
        }
        
    } else {
        return {
            'text': 'Sala não encontrada'
        }   
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
		    sufix = (interval === 0) ? ':00' : ':30';
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
