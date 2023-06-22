const roadCanvas = document.getElementById('roadCanvas');
roadCanvas.height = window.innerHeight;
roadCanvas.width = 400;

const roadContext = roadCanvas.getContext('2d');
const track = new Track(roadCanvas.width/2, roadCanvas.width*0.8);
let car_y = 100;
let tmp = track.getLaneCenter(1, car_y)
const car = new Car(tmp.x, car_y, 40, 60, false, true, 'black', 'red', 5, 2, tmp.angle);
car.draw(roadContext);
traffic = []
for (let i = 0; i < 0; i++) {
    traffic.push(new Car(track.getLaneCenter(i, 10).x, 10, 40, 60, true, false, 'blue', 'pink', 2, 0.5, track.getLaneCenter(i).angle));
}




const networkCanvas = document.getElementById('networkCanvas');
networkCanvas.height = window.innerHeight;
networkCanvas.width = 400;

const networkContext = networkCanvas.getContext('2d');
// Visualizer.drawNetwork(networkContext, car.brain);


function animate(time) {
    collision_objects = [track.borders];
    for (let i = 0; i < traffic.length; i++) {
        collision_objects.push(traffic[i].borders);
        traffic[i].update([track.borders, car.borders]);
    }
    car.update(collision_objects);
    roadCanvas.height = window.innerHeight;

    let translate = {x: 0, y: roadCanvas.height*0.7 - car.y};
//     for (let i=2; i<track.borders.length; i+=2) {
//         const top_left = track.borders[i][0];
//         const top_right = track.borders[i+1][0];
//         const bottom_left = track.borders[i][1];
//         const bottom_right = track.borders[i+1][1];
        
//         if ((top_left.y <= car.y) && (car.y <= bottom_right.y)) {
//             const left_x = ((car.y - bottom_left.y)*(top_left.x - bottom_left.x)/(top_left.y - bottom_left.y)) + bottom_left.x;
//             const right_x = ((car.y - bottom_right.y)*(top_right.x - bottom_right.x)/(top_right.y - bottom_right.y)) + bottom_right.x;
//             if ((left_x <= car.x) && (car.x <= right_x)) {
//                 translate.x = (roadCanvas.width/2) - ((left_x + right_x)/2);
//                 break;
//             }
//         }
//     }

    roadContext.save()
    roadContext.translate(translate.x, translate.y);
    track.draw(roadContext);
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(roadContext);
    }
    car.draw(roadContext);
    roadContext.restore();
    
    // for (let i = 0; i < 4; i++) {
    //     roadContext.beginPath();
    //     roadContext.moveTo(track.borders[i][0].x, track.borders[i][0].y);
    //     roadContext.lineTo(track.borders[i][1].x, track.borders[i][1].y);
    //     roadContext.stroke();
    // }
    // for (let i = 0; i < 4; i++) {
    //     roadContext.beginPath();
    //     roadContext.moveTo(car.borders[i][0].x, car.borders[i][0].y);
    //     roadContext.lineTo(car.borders[i][1].x, car.borders[i][1].y);
    //     roadContext.stroke();
    // }


    networkCanvas.height = window.innerHeight;
    networkContext.lineDashOffset = time*2;
    Visualizer.drawNetwork(networkContext, car.brain);
    requestAnimationFrame(animate);
}

animate()
