
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
        this.angleChange = 0.005;
        this.speed = 0
        this.friction = 0.02;
        this.acceleration = 0.1;
        this.maxSpeed = 5;
        this.maxReverseSpeed = 2;

        this.getCorners();
        this.getCarBorders();

        this.controls = new Controls();
        this.sensor = new Sensor(this, 30, 200, 3.14)
    }

    getCarBorders() {
        this.borders = [];
        for (let i=0; i<4; i++) {
            let start = {x: this.corner_x[i] + this.x, y: this.corner_y[i] + this.y};
            let j = (i+1)%4;
            let end = {x: this.corner_x[j] + this.x, y: this.corner_y[j] + this.y};
            this.borders.push([start, end])
        }
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

    update(trackBorders) { this.sensor.update(trackBorders); this.#move(); this.getCorners(); this.getCarBorders(); this.#checkCollision(trackBorders); }
    
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
            if (this.controls.left)  { this.angle -= this.angleChange*reverse_flip; }
            if (this.controls.right) { this.angle += this.angleChange*reverse_flip; }
            if (this.angle > Math.PI) { this.angle -= 2*Math.PI; }
            if (this.angle < Math.PI) { this.angle += 2*Math.PI; }
        }

        this.y += this.speed * Math.cos(this.angle);
        this.x += this.speed * Math.sin(this.angle);

    }
    
    #checkCollision(trackBorders) {
        trackBorders.forEach(element => {
            this.borders.forEach(border => {
                const collision = getIntersection(border, element);
                if (collision != null) {
                    // this.speed = 0;
                    // console.log("Collosion at: ", collision);
                    console.log("Collosion!");
                }
            });
        });

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
        context.restore();
        
        // context.beginPath();
        // context.fillStyle = this.secondaryColor;
        // context.moveTo(0, -this.height/2);
        // context.lineTo(-this.width/2, 0);
        // context.lineTo(+this.width/2, 0);
        // context.closePath();
        // context.fill();
        // context.restore();
        
        for (let i = 0; i < 4; i++) {
            context.beginPath();
            context.arc(this.x+this.corner_x[i], this.y+this.corner_y[i], 2, 0, 2*Math.PI);
            context.fillStyle = this.secondaryColor;
            context.fill();
        }

        this.sensor.draw(context);
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
    constructor(x, width, laneCount=3, color='white', top=-100000, bottom=canvas.height+1000) {
        this.x = x;
        this.width = width;
        this.laneCount = laneCount;
        this.color = color;

        this.laneWidth = this.width / this.laneCount;
        this.left = this.x - this.width / 2;
        this.right = this.x + this.width / 2;
        this.top = top;
        this.bottom = bottom;

        this.topLeft = {x: this.left, y: this.top};
        this.topRight = {x: this.right,y:  this.top};
        this.bottomLeft = {x: this.left, y: this.bottom};
        this.bottomRight = {x: this.right,y:  this.bottom};

        this.borders = [
            [this.topLeft, this.topRight],
            [this.topRight, this.bottomRight],
            [this.bottomRight, this.bottomLeft],
            [this.bottomLeft, this.topLeft],
        ];
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
        this.borders.forEach((border) => {
            context.beginPath();
            context.moveTo(border[0].x, border[0].y);
            context.lineTo(border[1].x, border[1].y);
            context.stroke();
        });

        for (let i = 0; i < this.laneCount; i++) {
            const text = "Lane: "+(1+i);
            const text_width = context.measureText(text).width;
            context.fillText("Lane: "+(1+i), this.getLaneCenter(i)-text_width/2, canvas.height*0);
        }

    }
}

class Sensor {
    constructor(car, rayCount=3, rayLength=100, raySpread=Math.PI/4, color='yellow', secondaryColor='red', lineWidth=2) {
        this.car = car;
        this.rayCount = rayCount;
        this.rayLength = rayLength;
        this.raySpread = raySpread;
        this.color = color;
        this.secondaryColor = secondaryColor;
        this.lineWidth = lineWidth;
        this.rays = [];
        this.readings = [];
    }

    update(trackBorders) {
        this.#castRays();
        this.readings = [];
        this.rays.forEach((ray) => {
            this.readings.push(this.#getReadings(ray, trackBorders))
            // let reading = this.#getReadings(ray, trackBorders);
            // if (reading) { console.log(reading); }
            // this.readings.push(reading);
        });
    }

    #getReadings(ray, trackBorders) {
        const intersections = [];
        trackBorders.forEach((border) => {
            const intersection = getIntersection(ray, border);
            if (intersection) {
                intersections.push(intersection);
            }
        });
        if (intersections.length == 0) { return null; }
        return intersections.sort((prev, curr) => {
            return (prev[2] > curr[2]) - (prev[2] < curr[2]);
        });
        // return intersections.sort((prev, curr) => {
        //     const prev_distance = distance(ray[0], prev);
        //     const curr_distance = distance(ray[0], curr);
        //     return (prev_distance < curr_distance) ? prev : curr;
        // });
    }


    #castRays() {
        this.rays = [];
        for (let i = 0; i < this.rayCount; i++) {
            const angle = this.car.angle + leniar_interpolation(-this.raySpread / 2, this.raySpread / 2, ((this.rayCount == 1) ? 0.5 : (i / (this.rayCount - 1))));
            const start = { x: this.car.x, y: this.car.y };
            const end = { x: this.car.x - this.rayLength * Math.sin(angle), y: this.car.y - this.rayLength * Math.cos(angle) };
            this.rays.push([start, end, angle]);
        }
    }

    draw(context) {
        context.lineWidth = this.lineWidth;
        for (let i = 0; i < this.rays.length; i++) {
            const ray = this.rays[i];
            let end;
            if (this.readings[i] == null) { end = [ray[1].x, ray[1].y]; }
            else { end = [this.readings[i][0].x, this.readings[i][0].y]; }
            context.strokeStyle = this.color;
            context.beginPath();
            context.moveTo(ray[0].x, ray[0].y);
            context.lineTo(...end);
            context.stroke();
            
            context.strokeStyle = this.secondaryColor;
            context.beginPath();
            context.moveTo(ray[1].x, ray[1].y);
            context.lineTo(...end);
            context.stroke();
        }
    }

}