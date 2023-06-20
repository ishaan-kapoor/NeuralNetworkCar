const canvas = document.getElementById('theCanvas');
canvas.height = window.innerHeight;
canvas.width = 200;

const context = canvas.getContext('2d');
// const track = new Track(canvas.width/2, canvas.width*0.9, 3, 'white', canvas.height*0.1, canvas.height*0.9);
// const track = new Track(canvas.width/2, canvas.width*0.9, 3, 'white', -canvas.height+350, 200);
const track = new Track(canvas.width/2, canvas.width*0.9);
const car = new Car(track.getLaneCenter(1), 100, 40, 60);
car.draw(context);
numberOfLanes = 3;

function animate() {
        car.update(track.borders);
        canvas.height = window.innerHeight;

        context.save()
        context.translate(0, canvas.height*0.7 - car.y);
        track.draw(context);
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
