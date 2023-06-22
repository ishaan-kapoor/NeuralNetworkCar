const canvas = document.getElementById('theCanvas');
canvas.height = window.innerHeight;
canvas.width = 400;

const context = canvas.getContext('2d');
// const track = new Track(canvas.width/2, canvas.width*0.9, 3, 'white', canvas.height*0.1, canvas.height*0.9);
// const track = new Track(canvas.width/2, canvas.width*0.9, 3, 'white', -canvas.height+350, 200);
const track = new Track(canvas.width/2, canvas.width*0.6);
// const car = new Car(track.getLaneCenter(1, 100).x, 100, 40, 60, true);
let car_y = 200;
const car = new Car(track.getLaneCenter(1, car_y).x, car_y, 40, 60, true, 'black', 'red', 5, 2, track.getLaneCenter(1, car_y).angle);
car.draw(context);
traffic = []
for (let i = 0; i < 2; i++) {
    traffic.push(new Car(track.getLaneCenter(i, 10).x, 10, 40, 60, false, 'blue', 'pink', 2, 0.5, track.getLaneCenter(1).angle));
}

function animate() {
        collision_objects = [track.borders];
        for (let i = 0; i < traffic.length; i++) {
                collision_objects.push(traffic[i].borders);
                traffic[i].update([track.borders, car.borders]);
        }
        car.update(collision_objects);
        canvas.height = window.innerHeight;

        context.save()
        context.translate(0, canvas.height*0.7 - car.y);
        track.draw(context);
        for (let i = 0; i < traffic.length; i++) {
                traffic[i].draw(context);
        }
        car.draw(context);
        context.restore();
        
        // for (let i = 0; i < 4; i++) {
        //     context.beginPath();
        //     context.moveTo(track.borders[i][0].x, track.borders[i][0].y);
        //     context.lineTo(track.borders[i][1].x, track.borders[i][1].y);
        //     context.stroke();
        // }
        // for (let i = 0; i < 4; i++) {
        //     context.beginPath();
        //     context.moveTo(car.borders[i][0].x, car.borders[i][0].y);
        //     context.lineTo(car.borders[i][1].x, car.borders[i][1].y);
        //     context.stroke();
        // }

        requestAnimationFrame(animate);
}

animate()
