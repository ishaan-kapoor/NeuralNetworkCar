
class Car {
    constructor(x, y, width, height, color='black', secondaryColor='red') {
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.color = color;
        this.secondaryColor = secondaryColor;
        this.diag_angle = Math.atan(this.height/this.width);
        this.diagonal = Math.sqrt(this.height**2 + this.width**2);

        this.angle = 0;
        this.speed = 0
        this.friction = 0.02;
        this.acceleration = 0.1;
        this.maxSpeed = 5;
        this.maxReverseSpeed = 2;

        this.getCorners();

        this.controls = new Controls();
    }

    getCorners() {
        this.corner_angles = [-this.angle + this.diag_angle, -this.angle - this.diag_angle, -this.angle + Math.PI + this.diag_angle, -this.angle + Math.PI - this.diag_angle];
        this.corner_x = this.corner_angles.map(angle => Math.cos(angle) * this.diagonal / 2);
        this.corner_y = this.corner_angles.map(angle => Math.sin(angle) * this.diagonal / 2);
        this.min_x = Math.min(...this.corner_x);
        this.max_x = Math.max(...this.corner_x);
        this.min_y = Math.min(...this.corner_y);
        this.max_y = Math.max(...this.corner_y);
    }

    update() { this.#move(); }
    #move() {
        if (this.controls.forward) { this.speed -= this.acceleration; }
        if (this.controls.reverse) { this.speed += this.acceleration; }
        
        if (this.speed > 0) { this.speed -= this.friction; }
        if (this.speed < 0) { this.speed += this.friction; }
        
        this.speed = Math.min(this.speed, this.maxReverseSpeed);
        this.speed = Math.max(this.speed, -this.maxSpeed)
        
        if (Math.abs(this.speed) < this.friction) { this.speed = 0; }
        
        if (this.speed != 0) {
            const reverse_flip = this.speed > 0 ? 1 : -1;
            if (this.controls.left)  { this.angle -= 0.01*reverse_flip; }
            if (this.controls.right) { this.angle += 0.01*reverse_flip; }
            if (this.angle > Math.PI) { this.angle -= 2*Math.PI; }
            if (this.angle < Math.PI) { this.angle += 2*Math.PI; }
        }

        this.y += this.speed * Math.cos(this.angle);
        this.x += this.speed * Math.sin(this.angle);

        this.getCorners()

        if (this.x+this.max_x >= canvas.width) { this.x = canvas.width-this.max_x; this.speed = 0; console.log('hit right'); }
        if (this.x+this.min_x < 0) { this.x = -this.min_x; this.speed = 0; console.log('hit left'); }
        if (this.y+this.max_y > canvas.height) { this.y = canvas.height - this.max_y; this.speed = 0; console.log('hit down'); }
        if (this.y+this.min_y < 0) { this.y = -this.min_y; this.speed = 0; console.log('hit up'); }
    }

    draw(context) {
        context.save()
        context.translate(this.x, this.y);
        context.rotate(-this.angle);
        context.fillStyle = this.color;
        const rect_start_x = -this.width / 2;
        const rect_start_y = -this.height / 2;
        context.fillRect(rect_start_x, rect_start_y, this.width, this.height);
        context.fillTrian
        // context.restore();
        
        context.beginPath();
        context.fillStyle = this.secondaryColor;
        context.moveTo(0, -this.height/2);
        context.lineTo(-this.width/2, 0);
        context.lineTo(+this.width/2, 0);
        context.closePath();
        context.fill();
        context.restore();
        
        for (let i = 0; i < 4; i++) {
            context.beginPath();
            context.arc(this.x+this.corner_x[i], this.y+this.corner_y[i], 2, 0, 2*Math.PI);
            context.fillStyle = this.secondaryColor;
            context.fill();
        }
    }
}

class Controls {
    constructor() {
        this.left = false;
        this.right = false;
        this.forward = false;
        this.reverse = false;

        this.#setKeyBoardListeners();
    }

    #setKeyBoardListeners() {
        document.onkeydown = (event) => {
            switch (event.key) {
                case 'ArrowLeft': this.left = true; break;
                case 'ArrowRight': this.right = true; break;
                case 'ArrowUp': this.forward = true; break;
                case 'ArrowDown': this.reverse = true; break;
            }
        }
        document.onkeyup = (event) => {
            switch (event.key) {
                case 'ArrowLeft': this.left = false; break;
                case 'ArrowRight': this.right = false; break;
                case 'ArrowUp': this.forward = false; break;
                case 'ArrowDown': this.reverse = false; break;
            }
        }
    }
}

class Track {
    constructor(x, width, laneCount=3, color='white', top=0, bottom=canvas.height) {
        this.x = x;
        this.width = width;
        this.laneCount = laneCount;
        this.color = color;

        // this.infinity = 1000
        this.laneWidth = this.width / this.laneCount;
        this.left = this.x - this.width / 2;
        this.right = this.x + this.width / 2;
        this.top = top;
        this.bottom = bottom;
    }

    getLane(x) {
        return Math.floor((x-this.left)/this.laneWidth);
    }

    getLaneCenter(lane) {
        lane = Math.max(0, lane);
        lane = Math.min(this.laneCount-1, lane);
        return leniar_interpolation(this.left, this.right, (lane+0.5)/this.laneCount);
    }

    draw(context) {
        context.lineWidth = 5;
        context.strokeStyle = this.color;

        for (let i = 1; i < this.laneCount; i++) {
            const x = leniar_interpolation(this.left, this.right, i/this.laneCount);
            context.beginPath();
            context.setLineDash([25, 15]);
            context.moveTo(x, this.top);
            context.lineTo(x, this.bottom);
            context.stroke();
        }

        context.setLineDash([]);
        context.beginPath();
        context.moveTo(this.left, this.top);
        context.lineTo(this.left, this.bottom);
        context.stroke();
        context.beginPath();
        context.moveTo(this.right, this.top);
        context.lineTo(this.right, this.bottom);
        context.stroke();


    }
}
