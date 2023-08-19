const roadCanvas = document.getElementById('roadCanvas');
roadCanvas.height = window.innerHeight;
roadCanvas.width = 400;

const roadContext = roadCanvas.getContext('2d');
const track = new Track(roadCanvas.width/2, roadCanvas.width*0.8);

const mutationRate = 0.9;
const cars = getCars(10);
let best_car = getBestCar();
const flex = true;  // Set to true to load the best car I have found so far
if (flex) {
    localStorage.setItem('best_car', '{"levels":[{"inputCount":9,"outputCount":1,"inputs":[0.7582280072814684,0.7110411707430002,0.5979478698974173,0.23052019927556933,0,0,0,0.10619899682730405,0.25215626673691405],"outputs":[0],"biases":[-1.4571307000694198],"weights":[[-0.9550651574459894],[1.1949643400769299],[-1.7561005370155058],[-2.746952054476535],[-0.9812947293070038],[0.873687427254092],[0.8901680184069077],[-1.2580556686253588],[0.9285207083344935]]},{"inputCount":1,"outputCount":4,"inputs":[0],"outputs":[1,0,1,1],"biases":[-0.877792515003035,1.1406500431923239,-1.3575053255568426,-1.168649800575765],"weights":[[0.6499240516689222,2.2708246440687234,-2.7328591840635896,-2.1137842605688504]]}]}');
}
if (localStorage.getItem('best_car')) {
    console.log("Loaded")
    console.log(localStorage.getItem('best_car'))
    const best_brain = JSON.parse(localStorage.getItem('best_car'));
    cars.forEach(car => { car.brain = JSON.parse(localStorage.getItem('best_car')); NeuralNetwork.mutate(car.brain, mutationRate) });
    best_car.brain = best_brain;
}

traffic = [
    getTrafficCar(1, -100),
    getTrafficCar(0, -300),
    getTrafficCar(0.5, -700),
    getTrafficCar(1, -1000),
    getTrafficCar(0, -1200),
    getTrafficCar(1, -1200),
    getTrafficCar(1, -1600),
    getTrafficCar(1, -1800),
    getTrafficCar(0, -2200),
    getTrafficCar(0.5, -2700),
    getTrafficCar(0, -3000),
    getTrafficCar(1, -3400),
    getTrafficCar(0, -3900),
    getTrafficCar(0.75, -4300),
    getTrafficCar(1, -4900),
    getTrafficCar(0, -5500),
    getTrafficCar(0.8, -6000),
    getTrafficCar(1, -6300),
    getTrafficCar(0, -6300),
    getTrafficCar(0.6, -6800),
    getTrafficCar(1, -7200),
]


const networkCanvas = document.getElementById('networkCanvas');
networkCanvas.height = window.innerHeight;
networkCanvas.width = 800;
const networkContext = networkCanvas.getContext('2d');


animate()


function animate(time) {
    collision_objects = [track.borders];
    for (let i = 0; i < traffic.length; i++) {
        collision_objects.push(traffic[i].borders);
        traffic[i].update([track.borders]);
    }
    cars.forEach(car => { car.update(collision_objects); });
    roadCanvas.height = window.innerHeight;

    best_car.draw_sensors = false;
    best_car = getBestCar();
    best_car.draw_sensors = true;

    let translate = {x: 0, y: roadCanvas.height*0.7 - best_car.y};
    roadContext.save()
    roadContext.translate(translate.x, translate.y);
    track.draw(roadContext);
    traffic.forEach(car => { car.draw(roadContext); });
    roadContext.globalAlpha = 0.5;
    cars.forEach(car => { car.draw(roadContext); });
    roadContext.globalAlpha = 1;
    best_car.draw(roadContext);
    roadContext.restore();

    networkCanvas.height = window.innerHeight;
    networkContext.lineDashOffset = time*2;
    Visualizer.drawNetwork(networkContext, best_car.brain);
    requestAnimationFrame(animate);
}

function getTrafficCar(lane, y) {
    const tmp = track.getLaneCenter(lane, y)
    return new Car(tmp.x, y, 40, 60, true, false, false, 'blue', 'pink', 2, 0.5, tmp.angle);
}


function getCar(lane, y) {
    let tmp = track.getLaneCenter(lane, y)
    return new Car(tmp.x, y, 40, 60, false, true, false, 'green', 'red', 5, 2, tmp.angle);
}

function getCars(n) {
    let cars = [];
    // cars = [new Car(track.getLaneCenter(1).x, 100, 40, 60, false, false, true, 'green', 'red', 5, 2, 0)];
    for (let i = 0; i < n; i++) {
        cars.push(getCar(1, 200));
    }
    return cars;
}

function getBestCar() {
    return cars.reduce((prev, curr) => prev.y < curr.y ? prev : curr);
}

function save() {
    localStorage.setItem('best_car', JSON.stringify(best_car.brain));
    console.log("Saved")
}
function discard() {
    localStorage.removeItem('best_car');
    console.log("Discarded")
}