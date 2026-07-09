// 2D Canvas 2: Interactive Primitive Mark

var sketch2 = function(p) {

    p.setup = function() {
        var canvas = p.createCanvas(600, 300);
        canvas.parent("canvas-container-2");
    };

    p.draw = function() {
        p.background(242, 240, 233);

        // mouse controls
        var barWidth = p.mouseX;
        var cutSize = p.mouseY / 2;

        // keep values in a reasonable range
        barWidth = p.constrain(barWidth, 180, 420);
        cutSize = p.constrain(cutSize, 20, 60);

        // main black shape
        p.noStroke();
        p.fill(15);

        p.rect(300 - barWidth / 2, 130, barWidth, 40);
        p.ellipse(300 - barWidth / 2, 150, 80, 80);
        p.ellipse(300 + barWidth / 2, 150, 80, 80);
        p.rect(275, 90, 50, 120);

        // negative space
        p.fill(242, 240, 233);

        p.ellipse(300 - barWidth / 2, 150, cutSize, cutSize);
        p.ellipse(300 + barWidth / 2, 150, cutSize, cutSize);
        p.rect(325, 170, 65, 40);

        // guide lines
        p.stroke(170, 60, 45);
        p.strokeWeight(1);

        p.line(100, 170, 500, 170);
        p.line(275, 80, 275, 225);
        p.line(325, 80, 325, 225);

        // label
        p.noStroke();
        p.fill(15);
        p.textSize(12);
        p.text("interactive primitive mark / move mouse", 100, 255);
    };
};

new p5(sketch2);