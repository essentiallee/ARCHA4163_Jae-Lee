// 2D Canvas 1: Drawing with Primitives
// A simple abstract mark using basic p5.js shapes.
// The idea is inspired by logo construction: circles, rectangles,
// horizontal alignment, and negative space.

let sketch1 = function(p) {

    p.setup = function() {
        let canvas = p.createCanvas(720, 420);
        canvas.parent("canvas-container-1");

        // Static drawing: only draw once
        p.noLoop();
    };

    p.draw = function() {
        // basic colors
        let bg = p.color(242, 240, 233);     // warm white background
        let ink = p.color(15, 15, 15);       // near-black
        let guide = p.color(180, 70, 50);    // muted red construction line

        p.background(bg);

        // -----------------------------
        // 1. Light construction grid
        // -----------------------------
        p.stroke(210);
        p.strokeWeight(1);

        for (let x = 60; x <= 660; x += 60) {
            p.line(x, 80, x, 330);
        }

        for (let y = 90; y <= 330; y += 60) {
            p.line(60, y, 660, y);
        }

        // -----------------------------
        // 2. Main black horizontal form
        // -----------------------------
        p.noStroke();
        p.fill(ink);

        // center bar
        p.rect(130, 190, 460, 42);

        // rounded left and right ends
        p.ellipse(130, 211, 84, 84);
        p.ellipse(590, 211, 84, 84);

        // -----------------------------
        // 3. Vertical block
        // -----------------------------
        p.rect(330, 120, 60, 180);

        // -----------------------------
        // 4. Negative-space cuts
        // Draw with the background color on top of the black shapes.
        // This creates the feeling of carved-out geometry.
        // -----------------------------
        p.fill(bg);

        // left circular cut
        p.ellipse(145, 211, 58, 58);

        // right circular cut
        p.ellipse(575, 211, 58, 58);

        // center lower cut
        p.rect(390, 232, 85, 68);

        // center upper cut
        p.rect(245, 120, 85, 70);

        // -----------------------------
        // 5. Thin guide lines
        // -----------------------------
        p.stroke(guide);
        p.strokeWeight(1);

        // baseline
        p.line(80, 232, 640, 232);

        // vertical construction marks
        p.line(330, 105, 330, 315);
        p.line(390, 105, 390, 315);

        // -----------------------------
        // 6. Small label
        // -----------------------------
        p.noStroke();
        p.fill(ink);
        p.textSize(12);
        p.text("primitive mark / ellipse + rectangle + line", 80, 360);
    };
};

new p5(sketch1);