// 2D Canvas 1: Drawing with Primitives
// This sketch practices basic p5.js shapes:
// rectangle, circle, triangle, line, and text.

let sketch1 = function(p) {

    p.setup = function() {
        // create the canvas size
        let canvas = p.createCanvas(700, 450);

        // attach this canvas to the HTML container
        canvas.parent("canvas-container-1");

        // noLoop means the drawing only happens once
        // this makes it a static drawing
        p.noLoop();
    };

    p.draw = function() {
        // background color
        p.background(238, 234, 226);

        // -----------------------------
        // 1. Draw a simple frame
        // -----------------------------
        p.noFill();
        p.stroke(30);
        p.strokeWeight(1);
        p.rect(50, 50, 600, 350);

        // -----------------------------
        // 2. Draw a large rectangle
        // -----------------------------
        p.noStroke();
        p.fill(30, 30, 30);
        p.rect(100, 120, 160, 220);

        // -----------------------------
        // 3. Draw a circle
        // -----------------------------
        p.fill(180, 60, 45);
        p.circle(360, 230, 140);

        // -----------------------------
        // 4. Draw a triangle
        // -----------------------------
        p.fill(50, 90, 150);
        p.triangle(500, 120, 430, 340, 580, 340);

        // -----------------------------
        // 5. Add a few simple lines
        // -----------------------------
        p.stroke(30);
        p.strokeWeight(2);
        p.line(100, 360, 600, 90);

        p.strokeWeight(1);
        p.line(120, 90, 120, 360);
        p.line(580, 90, 580, 360);

        // -----------------------------
        // 6. Add title text
        // -----------------------------
        p.noStroke();
        p.fill(30);
        p.textSize(14);
        p.text("Static Primitive Composition", 100, 390);
    };
};

new p5(sketch1);