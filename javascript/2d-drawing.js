let sketch1 = function(p) {

    p.setup = function() {
        let canvas = p.createCanvas(700, 450);
        canvas.parent("canvas-container-1");

        p.noLoop();
    };

    p.draw = function() {
        p.background(238, 234, 226);

        // outer composition frame
        p.noFill();
        p.stroke(25);
        p.strokeWeight(1);
        p.rect(40, 40, 620, 370);

        // large black mass
        p.noStroke();
        p.fill(18, 18, 18);
        p.rect(80, 95, 170, 250);

        // red circle
        p.fill(180, 48, 38);
        p.circle(335, 210, 155);

        // blue vertical rectangle
        p.fill(38, 72, 140);
        p.rect(460, 85, 70, 260);

        // pale architectural block
        p.fill(210, 202, 185);
        p.rect(545, 160, 65, 185);

        // diagonal line system
        p.stroke(18);
        p.strokeWeight(2);
        p.line(90, 360, 610, 90);

        p.strokeWeight(1);
        p.line(120, 385, 620, 135);
        p.line(70, 300, 500, 70);

        // smaller circular nodes
        p.noStroke();
        p.fill(245, 210, 80);
        p.circle(150, 130, 32);

        p.fill(18);
        p.circle(570, 120, 22);

        p.fill(238, 234, 226);
        p.circle(335, 210, 55);

        // small grid marks
        p.stroke(18);
        p.strokeWeight(1);

        for (let x = 285; x <= 420; x += 15) {
            p.line(x, 345, x, 365);
        }

        for (let y = 105; y <= 315; y += 15) {
            p.line(430, y, 450, y);
        }

        // title text inside canvas
        p.noStroke();
        p.fill(18);
        p.textSize(12);
        p.textAlign(p.LEFT);
        p.text("2D PRIMITIVE FIELD / STATIC STUDY", 80, 385);
    };
};

new p5(sketch1);