
class NeuralNetwork {
    constructor(neuronCounts) {
        this.levels = new Array(neuronCounts.length-1);
        for (let i = 0; i < neuronCounts.length-1; i++) {
            this.levels[i] = new Level(neuronCounts[i], neuronCounts[i+1]);
        }
    }

    static feedForward(network, givenInputs) {
        let outputs = givenInputs;
        for (let i = 0; i < network.levels.length; i++) {
            outputs = Level.feedForward(network.levels[i], outputs);
        }
        return outputs; 
    }
}



class Level {
    constructor(inputCount, outputCount) {
        this.inputCount = inputCount;
        this.outputCount = outputCount;
        
        this.inputs = new Array(inputCount);
        this.outputs = new Array(outputCount);

        this.biases = new Array(outputCount);
        this.weights = [];
        for (let i = 0; i < inputCount; i++) { this.weights[i] = new Array(outputCount); }

        Level.#randomize(this);
    }

    static #randomize(level) {
        for (let i = 0; i < level.inputCount; i++) {
            for (let j = 0; j < level.outputCount; j++) {
                level.weights[i][j] = Math.random()*2-1;
            }
        }

        for (let i = 0; i < level.outputCount; i++) {
            level.biases[i] = Math.random()*2-1;
        }
    }

    static feedForward(level, inputs) {
        for (let i = 0; i < level.inputCount; i++) {
            level.inputs[i] = inputs[i];
        }

        for (let i = 0; i < level.outputCount; i++) {
            let sum = 0;
            for (let j = 0; j < level.inputCount; j++) {
                sum += level.inputs[j] * level.weights[j][i];
            }
            if (sum > level.biases[i]) {
                level.outputs[i] = 1;
            } else {
                level.outputs[i] = 0;
            }
        }

        return level.outputs;
    }
}

class Visualizer {
    constructor() {
    }
    static drawNetwork(context, network) {
        const margin = 50;
        const top = margin;
        const bottom = context.canvas.height - margin;
        const left = margin;
        const right = context.canvas.width - margin;
        for (let i=network.levels.length-1; i>=0; i--) {
            const level = network.levels[i];
            const levelBottom = leniar_interpolation(bottom, top, i/network.levels.length);
            const levelTop = leniar_interpolation(bottom, top, (i+1)/network.levels.length);
            Visualizer.drawLevel(context, level, levelTop, left, right, levelBottom, i==0, (i==network.levels.length-1)?["^", "<", ">", "v"]:"values");
        }
    }
    static drawLevel(context, level, top, left, right, bottom, drawInputs=false, outputLables=null) {
        const {inputs, outputs, weights, biases} = level;
        
        context.lineWidth = 2;
        context.setLineDash([7, 10]);
        for (let i=0; i<inputs.length; i++) {
            const input_x = leniar_interpolation(left, right, i/(inputs.length-1));
            for (let j=0; j<level.outputs.length; j++) {
                const output_x = leniar_interpolation(left, right, j/(outputs.length-1));
                context.beginPath();
                context.moveTo(input_x, bottom);
                context.lineTo(output_x, top);
                context.strokeStyle = Visualizer.getRGBa(weights[i][j]);
                context.stroke();
            }
        }
        context.setLineDash([]);


        if (outputLables == "values") { outputLables = outputs.map(x => Math.round(x*100)/100); }
        Visualizer.drawNodes(context, outputs, top, left, right, outputLables, biases.map(Visualizer.getRGBa));
        if (drawInputs) {
            Visualizer.drawNodes(context, inputs, bottom, left, right, inputs.map(x => Math.round(x*100)/100), null);
        }
    }

    static drawNodes(context, nodes, y, left, right, lables=null, outlineColors=null) {
        for (let i=0; i<nodes.length; i++) {
            const x = leniar_interpolation(left, right, i/(nodes.length-1));
            Visualizer.drawNeuron(context, x, y, (nodes[i]==0)?'white':'yellow', (outlineColors)?outlineColors[i]:'black', (lables)?lables[i]:null);
        }
    }

    static drawNeuron(context, x, y, color='white', outlineColor='black', lable=null) {
        const neuronRadius = 30;
        const neuronOutlineWidth = 10;
        context.beginPath();
        context.arc(x, y, neuronRadius, 0, 2*Math.PI);
        context.fillStyle = color;
        context.fill();
        context.lineWidth = neuronOutlineWidth;
        context.strokeStyle = outlineColor;
        context.setLineDash([3, 3]);
        context.stroke();
        if (lable != null) {
            context.beginPath();
            context.textalign = "center";
            context.textBaseline = "middle";
            context.font = neuronRadius+"px Arial";
            context.fillStyle = "black";
            context.strokeStyle = "black";
            const tmp = context.measureText(lable).width;
            context.fillText(lable, x-tmp/2, y);
            context.lineWidth = 0.5;
            context.strokeText(lable, x-tmp/2, y);
        }
    }
    
    static getRGBa(val) {
        const R = (val<0)?255:0
        const G = (val>0)?255:0
        const B = 0;
        const a = Math.abs(val);
        return "rgba("+R+","+G+","+B+","+a+")";
    }
}