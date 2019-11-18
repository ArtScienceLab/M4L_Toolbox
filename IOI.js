/*
Large oscillator beat tracking based on (Large 1995)

Inlet 0 = Timeticks 	(bang)
Inlet 1 = Note onset 	(bang)

Outlet 0 = Period 		(float (seconds))
Outlet 1 = Phase 		(float [0,1])

*/


inlets = 2;
outlets = 2;

var IOI_nb = 5;
var mid = Math.floor(IOI_nb / 2);
var IOI_counter = 0;
var IOI_array = new Array(IOI_nb);

var zeroTime = 0.;
var lastTime = 0.;
var nowTime = 0.;

var note_counter = 0;
var period = 0.;
var phi = 0.;
var t_exp = 0.;

// ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

function loadbang() {
    reset();
}

function bang() {
	if (inlet === 1) {
		note_counter += 1;
	}
	
	if (period === 0.) {
 		if (note_counter > 0) {
			if (zeroTime === 0.) {
				zeroTime = new Date().getTime();
			}
			nowTime = (new Date().getTime() - zeroTime)/1000.;
			IOI_array[IOI_counter % IOI_nb] = nowTime - lastTime;
			note_counter = 0;
			lastTime = nowTime;
			IOI_counter += 1;
		}	
		if (IOI_counter > IOI_nb) {
			period = median();
			note_counter = 0;
		}	
    } else if (inlet === 0) {
       	update();
	}
}

function reset() {
    zeroTime = 0.;
    phi = 0;
	t_exp = 0.;
	period = 0.;
	IOI_array = new Array(IOI_nb);
	IOI_counter = 0;
	outlet(1, phi);
	outlet(0, period); 
}

function IOI_nb(x) {
    IOI_nb = x;
}

// ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

function update() {	
    nowTime = new Date().getTime();
    deltaTime = (nowTime - zeroTime) / 1000.0;
	
	while (deltaTime > (t_exp + (period/2.))) {
		t_exp += period
	}
    phi = (((deltaTime - t_exp) / period) + 1) % 1.;

	if (note_counter > 0 && period != 0.) {
		update_IOI();
        period = median();
		note_counter = 0;
	}
		
	outlet(1, phi);
	outlet(0, period);
}

function update_IOI() {
	nowTime = (new Date().getTime() - zeroTime)/1000.;
	IOI_array[IOI_counter % IOI_nb] = nowTime - lastTime;
	lastTime = nowTime;
	IOI_counter += 1;
}

function median() {
    nums = IOI_array.slice().sort();
  return IOI_nb % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
}