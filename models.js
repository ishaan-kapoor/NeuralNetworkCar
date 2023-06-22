
class Car {
    constructor(x, y, width, height, dummy=false, AI=false, color='black', secondaryColor='red', maxSpeed=5, maxReverseSpeed=2, angle=0) {
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.color = color;
        this.secondaryColor = secondaryColor;
        this.diag_angle = Math.atan(this.height/this.width);
        this.diagonal = Math.sqrt(this.height**2 + this.width**2);

        this.dummy = dummy;
        this.AI = (!dummy) && AI;
        this.angle = angle;
        this.angleChange = 0.005;
        this.speed = 0
        this.friction = 0.02;
        this.acceleration = 0.1;
        this.maxSpeed = maxSpeed;
        this.maxReverseSpeed = maxReverseSpeed;
        this.damaged = false;

        this.getCorners();
        this.getCarBorders();

        if (!AI) {
            this.controls = new Controls(!dummy);
        } else {
            this.controls = {forward: false, reverse: false, left: false, right: false};
        }
        if (!dummy) {
            // this.sensor = new Sensor(this, 30, 200, 3.14)
            this.sensor = new Sensor(this)
            this.brain = new NeuralNetwork([this.sensor.rayCount, 2, 4]);
        }
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


    update(collision_objects) {
        if (this.damaged) { return; }
        if (this.sensor) {
            this.sensor.update(collision_objects);
            const offsets = this.sensor.readings.map(reading => reading==null?0:1-reading[0].offset);
            if (offsets.length != this.sensor.rayCount) { console.log("Sensor error"); return; }
            const outputs = NeuralNetwork.feedForward(this.brain, offsets);
            // console.log(outputs);
            if (this.AI) {
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.reverse = outputs[3];
            }
        }
        this.#move();
        this.getCorners();
        this.getCarBorders();
        this.#checkCollision(collision_objects);
    }
    
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
    
    #checkCollision(collision_objects) {
        // trackBorders.forEach(element => {
        //     this.borders.forEach(border => {
        //         const collision = getIntersection(border, element);
        //         if (collision != null) {
        //             // this.speed = 0;
        //             // console.log("Collosion at: ", collision);
        //             this.secondaryColor = this.color;
        //             this.color = 'red';
        //             console.log("Collosion!");
        //             this.damaged = true;
        //         }
        //     });
        // });
        for (let i=0; i<collision_objects.length; i++) {
            const collision = intersecting_polygons(this.borders, collision_objects[i]);
            if (collision != null) {
                this.secondaryColor = this.color;
                this.color = 'red';
                console.log("Collosion!");
                this.damaged = true;
            }
        }

    }

    draw(context) {
        // context.save()
        // context.translate(this.x, this.y);
        // context.rotate(-this.angle);
        // context.fillStyle = this.color;
        // const rect_start_x = -this.width / 2;
        // const rect_start_y = -this.height / 2;
        // context.fillRect(rect_start_x, rect_start_y, this.width, this.height);
        // context.restore();

        this.getCorners();
        context.beginPath();
        context.fillStyle = this.color;
        context.moveTo(this.corner_x[0]+this.x, this.corner_y[0]+this.y);
        for (let i = 0; i < 4; i++) {
            context.lineTo(this.corner_x[i]+this.x, this.corner_y[i]+this.y);
        }
        context.closePath();
        context.fill();
        
        for (let i = 0; i < 4; i++) {
            context.beginPath();
            context.arc(this.x+this.corner_x[i], this.y+this.corner_y[i], 2, 0, 2*Math.PI);
            context.fillStyle = this.secondaryColor;
            context.fill();
        }

        if (this.sensor) { this.sensor.draw(context); }
    }
}

class Controls {
    constructor(userControlled=true) {
        this.left = false;
        this.right = false;
        this.forward = false;
        this.reverse = false;

        if (userControlled) {
            this.#setKeyBoardListeners();
        } else {
            this.#setRandomListeners();
        }
    }

    #setRandomListeners() {
        this.left = false;
        this.right = false;
        this.forward = true;
        this.reverse = false;
        // setInterval(() => {
        //     this.left = Math.random() > 0.5;
        //     this.right = !this.left;
        //     this.forward = Math.random() > 0.5;
        //     this.reverse = !this.forward;
        // }, 50);
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

    update(collision_objects) {
        this.#castRays();
        this.readings = [];
        this.rays.forEach((ray) => {
            let ray_readings = [];
            collision_objects.forEach((borders) => {
                const reading = this.#getReadings(ray, borders);
                if (reading) { ray_readings.push(...reading); }
            });
            ray_readings.sort((prev, curr) => {
                return (prev.offset > curr.offset) - (prev.offset < curr.offset);
            });
            if (ray_readings.length == 0) { ray_readings = null; }
            this.readings.push(ray_readings);
        });
    }

    #getReadings(ray, borders) {
        const intersections = [];
        borders.forEach((border) => {
            const intersection = getIntersection(ray, border);
            if (intersection) {
                intersections.push(intersection);
            }
        });
        if (intersections.length == 0) { return null; }
        // if (intersections.length > 1) { console.log(intersections); }
        // intersections.sort((prev, curr) => {
        //     return (prev.offset > curr.offset) - (prev.offset < curr.offset);
        // });
        // if (intersections.length > 1) { console.log(intersections); exit();}
        return intersections
        // return intersections.sort((prev, curr) => {
        //     const prev_distance = distance(ray[0], prev);
        //     const curr_distance = distance(ray[0], curr);
        //     return (prev_distance < curr_distance) ? prev : curr;
        // });
    }

    #castRays() {
        this.rays = [];
        for (let i = 0; i < this.rayCount; i++) {
            const angle = this.car.angle + leniar_interpolation(this.raySpread / 2, -this.raySpread / 2, (i / (this.rayCount - 1)));
            const start = { x: this.car.x, y: this.car.y };
            const end = { x: this.car.x - this.rayLength * Math.sin(angle), y: this.car.y - this.rayLength * Math.cos(angle) };
            this.rays.push([start, end, angle]);
        }
    }

    draw(context) {
        context.lineWidth = this.lineWidth;
        // if (this.readings.length != this.rays.length) { console.log(this.readings); exit(); }
        for (let i = 0; i < this.rays.length; i++) {
            const ray = this.rays[i];
            let end = [ray[1].x, ray[1].y];;
            if (this.readings[i]) { end = [this.readings[i][0].x, this.readings[i][0].y]; }

            context.strokeStyle = this.color;
            context.beginPath();
            context.moveTo(ray[0].x, ray[0].y);
            context.lineTo(...end);
            context.stroke();
            
            context.strokeStyle = this.secondaryColor;
            context.beginPath();
            context.moveTo(...end);
            context.lineTo(ray[1].x, ray[1].y);
            context.stroke();
        }
    }

}

class Track {
    constructor(x, width, laneCount=3, color='white', top=-2*(10**4), bottom=500) {
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

        this.#makeBorders()
    }

    #makeBorders() {
        // let right_curve_start = {x: this.right+70, y: leniar_interpolation(this.top, this.bottom, 0.75)};
        // let left_curve_start = {x: this.left+70, y: leniar_interpolation(this.top, this.bottom, 0.75)};
        // let left_curve_end = {x: this.left-70, y: leniar_interpolation(this.top, this.bottom, 0.95)};
        // let right_curve_end = {x: this.right-70, y: leniar_interpolation(this.top, this.bottom, 0.95)};

        this.borders = [
            // ! assumptions:
            // * all borders are straight lines. i.e. if curves are needed, they are made up of multiple straight lines
            // * all borders[i] and borders[i+1] are parallel
            // * borders must have even number of entries
            // * 1st 2 entries are the top and bottom borders
            [this.topLeft, this.topRight],
            [this.bottomRight, this.bottomLeft],
            // [this.topRight, right_curve_start],
            // [this.topLeft, left_curve_start],
            [this.topRight, this.bottomRight],
            [this.bottomLeft, this.topLeft],
        ];

        // left_curve_end = this.#makeCurveBorders(left_curve_start, left_curve_end);
        // right_curve_end = {x: left_curve_end.x+this.width, y: left_curve_end.y};

        // this.borders.push([right_curve_end, right_curve_start]);
        // this.borders.push([left_curve_start, left_curve_end]);

        // this.borders.push([right_curve_end, this.bottomRight]);
        // this.borders.push([this.bottomLeft, left_curve_end]);


        // ! This corrects the order of points in borders
        // * Left Border comes before Right Border
        // * Top Point comes before Bottom Point in each Border
        // * Has no other effect but to maintain order which is usefull in other functions.
        for (let i=2; i<this.borders.length; i+=2) {
            if (this.borders[i][0].y > this.borders[i][1].y) {
                this.borders[i].reverse(); // [Top, Bottom]
            }
            if (this.borders[i+1][0].y > this.borders[i+1][1].y) {
                this.borders[i+1].reverse(); // [Top, Bottom]
            }
            if (this.borders[i][0].x > this.borders[i+1][0].x) {
                let tmp = this.borders[i];
                this.borders[i] = this.borders[i+1];
                this.borders[i+1] = tmp;
                // Left, Right
            }
        }

    }

    #makeCurveBorders(start, end, scale={x:60,y:300}, step=20) {
        let y;
        let x2;
        for (y=start.y; y<=end.y-step; y+=step) {
            const x1 = Math.sin((y-start.y)/scale.y)*scale.x;
            x2 = Math.sin(((y-start.y)+step)/scale.y)*scale.x;
            this.borders.push([{x: start.x+x1, y: y}, {x: start.x+x2, y: y+step}]);
            this.borders.push([{x: start.x+this.width+x1, y: y}, {x: start.x+this.width+x2, y: y+step}]);
        }
        return {x: start.x+x2, y: y};
    }

    getLaneCenter(lane, y=0) {
        lane = Math.min(this.laneCount-1, lane);
        lane = Math.max(0, lane);

        for (let i=2; i<this.borders.length; i+=2) {

            let angle = - Math.atan((this.borders[i][1].y-this.borders[i][0].y)/(this.borders[i][1].x-this.borders[i][0].x));
            if (angle < 0) { angle += Math.PI/2; }
            else { angle -= Math.PI/2; }
            const top_x = leniar_interpolation(this.borders[i][0].x, this.borders[i+1][0].x, (lane+0.5)/this.laneCount);
            const bottom_x = leniar_interpolation(this.borders[i][1].x, this.borders[i+1][1].x, (lane+0.5)/this.laneCount);
            const top_y = this.borders[i][0].y;
            const bottom_y = this.borders[i][1].y;
            
            if ((top_y <= y) && (y <= bottom_y)) {
                return {
                    x: ((y - bottom_y)*(top_x - bottom_x)/(top_y - bottom_y)) + bottom_x,
                    angle: angle
                }
            }
        }

        return {x: leniar_interpolation(this.left, this.right, (lane+0.5)/this.laneCount), angle: 0};
    }

    draw(context) {
        context.lineWidth = 5;
        context.strokeStyle = this.color;

        context.setLineDash([20, 20]);
        for (let j = 2; j < this.borders.length; j+=2) {
            for (let i = 1; i < this.laneCount; i++) {
                const top_x = leniar_interpolation(this.borders[j][0].x, this.borders[j+1][0].x, i/this.laneCount);
                const bottom_x = leniar_interpolation(this.borders[j][1].x, this.borders[j+1][1].x, i/this.laneCount);
                const top_y = this.borders[j][0].y;
                const bottom_y = this.borders[j][1].y;

                context.beginPath();
                context.moveTo(top_x, top_y);
                context.lineTo(bottom_x, bottom_y);
                context.stroke();
            }
        }

        context.setLineDash([]);
        this.borders.forEach((border) => {
            context.beginPath();
            context.moveTo(border[0].x, border[0].y);
            context.lineTo(border[1].x, border[1].y);
            context.stroke();
        });

        // for (let i = 0; i < this.laneCount; i++) {
        //     const text = "Lane: "+(1+i);
        //     const text_width = context.measureText(text).width;
        //     context.fillText("Lane: "+(1+i), this.getLaneCenter(i)-text_width/2, canvas.height*0);
        // }

    }
}
