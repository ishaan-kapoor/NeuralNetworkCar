const canvas = document.getElementById('theCanvas');
canvas.height = window.innerHeight;
canvas.width = 200;

const context = canvas.getContext('2d');
const track = new Track(canvas.width/2, canvas.width*0.9);
const car = new Car(track.getLaneCenter(2), 100, 40, 60);
car.draw(context);

function animate() {
    car.update();
    canvas.height = window.innerHeight;

    // context.save()
    // context.translate(0, canvas.height/2 - car.y);
    track.draw(context);
    car.draw(context);
    // context.restore();

    requestAnimationFrame(animate);
}

animate()
