// 2D Canvas 1: Simple Primitive Mark

let sketch1 = function(p) {

    p.setup = function() {
        let canvas = p.createCanvas(720, 360);
        canvas.parent("canvas-container-1");
        p.noLoop();
    };

    p.draw = function() {
        p.background(242, 240, 233);

        // main black shape
        p.noStroke();
        p.fill(15);

        p.rect(180, 160, 360, 45);
        p.ellipse(180, 182, 90, 90);
        p.ellipse(540, 182, 90, 90);
        p.rect(330, 110, 60, 145);

        // negative space
        p.fill(242, 240, 233);
        p.ellipse(180, 182, 55, 55);
        p.ellipse(540, 182, 55, 55);
        p.rect(390, 205, 75, 50);

        // construction lines
        p.stroke(170, 60, 45);
        p.strokeWeight(1);
        p.line(120, 205, 600, 205);
        p.line(330, 95, 330, 270);
        p.line(390, 95, 390, 270);

        // label
        p.noStroke();
        p.fill(15);
        p.textSize(12);
        p.text("primitive mark / ellipse + rectangle", 120, 300);
    };
};

new p5(sketch1);