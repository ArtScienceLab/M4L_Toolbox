/*
Large oscillator beat tracking based on (Large 1995)

Inlet 0 = Timeticks 	(bang)
Inlet 1 = Note onset 	(bang)

Outlet 0 = Period 		(float (seconds))
Outlet 1 = Phase 		(float [0,1])

*/


inlets = 2;
outlets = 2;

var gamma = 1.;		// Width receptive field (2 -> about pi/4, 8 -> pi/8)
var n1 = 0.2;		// Coupling strength phase tracking
var n2 = 0.2;		// Coupling strength period tracking

var zeroTime = 0.;
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
				note_counter = 0;
			} else {
				period = new Date().getTime();
				period = (period - zeroTime) / 1000.0; 
				note_counter = 0;
			}
		}	
    } else if (inlet === 0) {
       	update();
	}
}

function reset() {
	gamma = 1.;
	n1 = 0.2;
	n2 = 0.2;
	
    zeroTime = 0.;
    phi = 0;
	period = 0.;
	t_exp = 0.;
	outlet(1, phi);
	outlet(0, period); 
}

function n1(x) {
	n1 = x;
}

function n2(x) {
	n2 = x;
}

function gamma(x) {
	gamma = x;
}

// ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~

function update() {	
    nowTime = new Date().getTime();
    deltaTime = (nowTime - zeroTime) / 1000.0;

	while (deltaTime > (t_exp + (period/2.))) {
		t_exp += period
	}
    phi = (((deltaTime - t_exp) / period) + 1) % 1.;

	if (note_counter > 0) {
		update_large(phi);
		note_counter = 0;
	}
		
	outlet(1, phi);
	outlet(0, period);
}


function update_large(phi)
{
	coupling_func = coupling(phi, gamma, period);
	period += n1 * coupling_func;
	t_exp += n2 * coupling_func;
}

function coupling(phi, gamma, period) {
	return period/(2*Math.PI) * Math.pow((1./cosh(gamma * (Math.cos(2*Math.PI*phi)-1))), 2) * Math.sin(2*Math.PI*phi);
}

function cosh(x) {
	return (Math.exp(x) + Math.exp(-x))/2.;
}