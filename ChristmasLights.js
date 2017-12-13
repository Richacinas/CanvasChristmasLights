
export default class ChristmasLights {

	constructor(toggleElId) {
		var canvasBody = document.getElementById("lightsStage");
		this.canvas = canvasBody.getContext("2d");

		this.w = canvasBody.width = window.innerWidth;
		this.h = canvasBody.height = window.innerHeight;

		this.tick = 0;
		this.lightsOn = true;
		this.wireInfos = [
			{
				start: {
					x: 0,
					y: -100
				},
				middle: {
					x: this.w/4,
					y: this.h/11
				},
				end: {
					x: this.w/1.5,
					y: -50,
				},
				strokeWidth: 2,
				color: "#222",
				stripeSwitchTime: 5
			},
			{
				start: {
					x: this.w/3,
					y: -30
				},
				middle: {
					x: this.w,
					y: this.h/10
				},
				end: {
					x: this.w*1.5,
					y: this.h/11
				},
				strokeWidth: 2,
				color: "#222",
				stripeSwitchTime: 10
			},
			{
				start: {
					x: 0,
					y: this.h/11,
				},
				middle: {
					x: this.w/4,
					y: this.h/7
				},
				end: {
					x: this.w,
					y: 50
				},
				stripeSwitchTime: 50
			}
		];

		this.opts = {
			canvas: {
				backgroundColor: "#375871",
				wireAmount: 1
			},
			wire: {
				spacing: 100,
				wireDistance: 25
			},
			particle: {
				minSize: 10,
				addedSize: 5,

				minShadowBlur: 15,
				addedShadowBlur: 20,

				offShadowBlur: 10,
				offShadowColor: "rgba(5,5,5,0.5)"
			},
		};

		this.Colors = [
			"#2ecc71", //green
			"#3498db", //blue
			"#9b59b6", //purple
			"#e74c3c", //red
			"#f1c40f" //yellow
		];

		this.wires = [];

		this.Wire = this.Wire.bind(this);
		this.Bulb = this.Bulb.bind(this);
		this.loop = this.loop.bind(this);
		this.initButton = this.initButton.bind(this);

		this.setup();
		this.initButton(toggleElId);
	}

	initButton(toggleElId) {
    var self = this;

    if (toggleElId) {
      $('#' + toggleElId).click(() => {
        self.lightsOn = !self.lightsOn;
      });
    }
  }

	setup(){
		for(var i = 0; i < this.wireInfos.length; i++){
			this.wires[i] = this.Wire(this.wireInfos[i]);
			this.wires[i].init(this.wireInfos[i]);
		}
		requestAnimFrame(this.loop);
	}

	loop(){
		var self = this;

		//this.canvas.fillStyle = this.opts.canvas.backgroundColor;
		//this.canvas.fillRect(0,0,this.w,this.h);
		this.canvas.clearRect(0, 0, this.w, this.h);
		this.tick++;
		this.wires.map( function( wire ){
			wire.render({
				style: "stripe",
				tick: self.tick
			});
			self.tick%wire.stripeSwitchTime == 0 ? wire.stripeSwitch() : true
		})

		requestAnimFrame(this.loop);
	};

	Wire(obj){
		var self = this;

		var stripeOrder = true;
		var stripeSwitchTime = obj.stripeSwitchTime;
		var bulbs = [];
		var flatLength;
		var equation;
		var strokeWidth, strokeColor;

		var stripeSwitch = function(){
			stripeOrder = !stripeOrder;
		};

		var init = function(obj){
			var x1 = obj.start.x;
			var x2 = obj.middle.x;
			var x3 = obj.end.x;
			var y1 = obj.start.y;
			var y2 = obj.middle.y;
			var y3 = obj.end.y;
			strokeWidth = obj.strokeWidth;
			strokeColor = obj.color;
			stripeSwitchTime = obj.stripeSwitchTime;
			var points = [];
			var wireDistance = self.opts.wire.wireDistance;
			flatLength = Math.sqrt( Math.pow(y3 - y1, 2) + Math.pow(x3 - x1, 2) );

			//WARNING!!! REALLY COMPLICATED!
			var A = ((y2 - y1)*(x1 - x3) + (y3-y1)*(x2-x1)) / ( (x1 - x3)*(Math.pow(x2, 2) - Math.pow(x1, 2)) + (x2 - x1)*(Math.pow(x3, 2) - Math.pow(x1, 2) ) ),
					B = ( (y2 - y1) - A*(x2*x2 - x1*x1) ) / (x2 - x1),
					C = (y1 - A*x1*x1 - B*x1);

			equation = function(x){ return A*x*x + B*x + C;};

			bulbs = [];
			var bulbAmount = flatLength / self.opts.wire.spacing;
			for(var i = 0; i < bulbAmount; i++){
				bulbs.push( self.Bulb(i*self.opts.wire.spacing, equation(i*self.opts.wire.spacing) + wireDistance, wireDistance) );
			}
		};

		var render = function(obj){
			//first rendering the bulbs
			if(!obj){
				for(var i = 0; i < bulbs.length; i++){
					bulbs[i].render({
						status: self.lightsOn ? "on" : "off"
					});
				}
			} else {
				if(obj.style == ""){
					for(var i = 0; i < bulbs.length; i++){
						bulbs[i].render({
							status: self.lightsOn ? "on" : "off"
						});
					}
				}
				if(obj.style == "stripe"){
					for(var i = stripeOrder ? 1 : 0; i < bulbs.length; i+=2){
						bulbs[i].render({
							status: self.lightsOn ? "on" : "off"
						});
						if(i > 0 && i + 1< bulbs.length){
							bulbs[i + 1].render({
								status: "off"
							});
						}
					}
				}
			}
			//BETTER DON'T TOUCH ANYTHING IN THIS METHOD AFTER THIS LINE
			//pushing the points of the line. Better don't touch. Freaking stupidness
      var points = [];
			for(var i = 0; i < flatLength; i++){
				points.push([i, equation(i)]);
			}
			//The rendering of the freaking points of the line. THESE ARE NOT BULBS! THIS THIS THING IS THE LINE, THE WIRE
			for(var i = 0; i < points.length - 1; i++){
				self.canvas.beginPath();
				self.canvas.moveTo(points[i][0], points[i][1]);
				self.canvas.lineTo(points[i + 1][0], points[i + 1][1]);
				self.canvas.lineWidth = strokeWidth;
				self.canvas.strokeStyle = strokeColor;
				self.canvas.stroke();
			};
		};

		return {init, render, stripeSwitch, stripeSwitchTime};
	}
	
	Bulb(Xpos, Ypos, wireDistance){
		var self = this;

		var x = Xpos;
		var y = Ypos;
		var wireDistance = wireDistance;
		var radius = this.opts.particle.minSize + Math.random()*this.opts.particle.addedSize;
		var color = this.Colors[Math.floor(Math.random()*this.Colors.length)];
		var shadowBlur = this.opts.particle.minShadowBlur + Math.random()*this.opts.particle.addedShadowBlur;

		var render = function(obj){
			shadowBlur = self.opts.particle.minShadowBlur + Math.random()*self.opts.particle.addedShadowBlur;
			//Drawing line
			self.canvas.beginPath();
			self.canvas.moveTo(x, y);
			self.canvas.lineTo(x, y - wireDistance);
			self.canvas.closePath();
			self.canvas.strokeStyle = self.opts.wire.color;
			self.canvas.stroke();

			//Drawing bulb
			if(obj.status == "on"){
				self.canvas.beginPath();
				self.canvas.arc(x, y, radius, 0, Math.PI*2);
				self.canvas.closePath();
				self.canvas.shadowBlur = shadowBlur;
				self.canvas.shadowColor = color;
				self.canvas.fillStyle = color;
				self.canvas.fill();
				self.canvas.shadowBlur = 0;
				self.canvas.shadowColor = "rgba(0,0,0,0)";
			}
			else if(obj.status == "off"){
				self.canvas.beginPath();
				self.canvas.arc(x, y, radius, 0, Math.PI*2);
				self.canvas.closePath();
				self.canvas.shadowBlur = self.opts.particle.offShadowBlur;
				self.canvas.shadowColor = self.opts.particle.offShadowColor;
				self.canvas.fillStyle = self.opts.canvas.backgroundColor;
				self.canvas.fill();
				self.canvas.shadowBlur = 0;
				self.canvas.shadowColor = "rgba(0,0,0,0)";
			}
		};

		return {render}
	}
}
