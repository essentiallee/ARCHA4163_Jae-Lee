// 2D Canvas 1: Simple Primitive Mark

var sketch1 = function(p) {

    p.setup = function() {
        var canvas = p.createCanvas(600, 300);
        canvas.parent("canvas-container-1");
        p.noLoop();
    };

    p.draw = function() {
        p.background(242, 240, 233);

        // main black shape
        p.noStroke();
        p.fill(15);

        p.rect(150, 130, 300, 40);
        p.ellipse(150, 150, 80, 80);
        p.ellipse(450, 150, 80, 80);
        p.rect(275, 90, 50, 120);

        // negative space
        p.fill(242, 240, 233);
        p.ellipse(150, 150, 60, 50);
        p.ellipse(450, 150, 60, 50);
        p.rect(325, 170, 65, 40);

        // construction lines
        p.stroke(170, 60, 45);
        p.strokeWeight(1);
        p.line(100, 170, 500, 170);
        p.line(275, 80, 275, 225);
        p.line(325, 80, 325, 225);

    };
};


new p5(sketch1);