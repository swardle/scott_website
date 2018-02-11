var asteroids;
(function (asteroids) {
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    // lerp between v0 when t=0 and v1 when t=1
    function lerp(v0, v1, t) {
        return (1 - t) * v0 + t * v1;
    }
    function MatMult(a, b) {
        var r = [];
        for (var i = 0; i < a.length; i++) {
            var row = [0, 0, 0];
            row[0] = b[0][0] * a[i][0] + b[0][1] * a[i][1] + b[0][2] * a[i][2];
            row[1] = b[1][0] * a[i][0] + b[1][1] * a[i][1] + b[1][2] * a[i][2];
            row[2] = b[2][0] * a[i][0] + b[2][1] * a[i][1] + b[2][2] * a[i][2];
            r.push(row);
        }
        return r;
    }
    function MakeTrans(tx, ty) {
        var mat = [
            [1, 0, tx],
            [0, 1, ty],
            [0, 0, 1]
        ];
        return mat;
    }
    function MakeRot(rotRad) {
        var sin = Math.sin(rotRad);
        var cos = Math.cos(rotRad);
        var mat = [
            [cos, -sin, 0],
            [sin, cos, 0],
            [0, 0, 1],
        ];
        return mat;
    }
    function MakeScale(sx, sy) {
        var mat = [
            [sx, 0, 0],
            [0, sy, 0],
            [0, 0, 1]
        ];
        return mat;
    }
    // from http://www.cg.info.hiroshima-cu.ac.jp/~miyazaki/knowledge/teche23.html
    // https://ardoris.wordpress.com/2008/07/18/general-formula-for-the-inverse-of-a-3x3-matrix/
    function MatInverse(m) {
        var a = m[0][0];
        var b = m[0][1];
        var c = m[0][2];
        var d = m[1][0];
        var e = m[1][1];
        var f = m[1][2];
        var g = m[2][0];
        var h = m[2][1];
        var i = m[2][2];
        var detm = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
        // there is no solusion
        // return null
        if (Math.abs(detm) < 0.0001) {
            return null;
        }
        var oodetm = 1 / detm;
        var ret = [
            [oodetm * (e * i - f * h), oodetm * (c * h - b * i), oodetm * (b * f - c * e)],
            [oodetm * (f * g - d * i), oodetm * (a * i - c * g), oodetm * (c * d - a * f)],
            [oodetm * (d * h - e * g), oodetm * (b * g - a * h), oodetm * (a * e - b * d)],
        ];
        return ret;
    }
    function TrasVerts(matrix, verts) {
        var outverts = [];
        for (var i = 0; i < verts.length; i++) {
            var outvert = [0, 0];
            outvert[0] = matrix[0][0] * verts[i][0] + matrix[0][1] * verts[i][1] + matrix[0][2] * 1;
            outvert[1] = matrix[1][0] * verts[i][0] + matrix[1][1] * verts[i][1] + matrix[1][2] * 1;
            outverts.push(outvert);
        }
        return outverts;
    }
    var Buttons = /** @class */ (function () {
        function Buttons() {
            this.dir = [0, 0];
            this.fire = 0;
            this.dir = [0, 0];
            this.fire = 0;
        }
        return Buttons;
    }());
    var Game = /** @class */ (function () {
        // Game::Game
        function Game(canvas, backcanvas, frontctx, backctx) {
            this.Objects = [];
            this.Canvas = backcanvas;
            this.FrontCanvas = canvas;
            this.Ctx = backctx;
            this.FrontCtx = frontctx;
            this.ScreenWidth = canvas.width;
            this.ScreenHeight = canvas.height;
            this.ConButtons = new Buttons;
            this.Objects = [];
            this.AddSpaceShip();
            this.AddAsteroid();
            this.AddAsteroid();
            this.AddAsteroid();
        }
        // game::AddSpaceShip
        Game.prototype.AddSpaceShip = function () {
            var sizeSpaceShip = 10;
            var x = randomInt(sizeSpaceShip, this.ScreenWidth - sizeSpaceShip);
            var y = randomInt(sizeSpaceShip, this.ScreenWidth - sizeSpaceShip);
            var r = sizeSpaceShip / 5.0;
            var rot = randomInt(0, 359);
            var rotRad = rot * Math.PI / 180;
            var sin = Math.sin(rotRad);
            var cos = Math.cos(rotRad);
            this.Objects.push({
                objtype: "SpaceShip",
                verts: [
                    [-5, 5],
                    [0, -5],
                    [5, 5],
                    [4, 3],
                    [-4, 3],
                    [0, 6],
                    [4, 3],
                ],
                matrix: [
                    [cos, -sin, x],
                    [sin, cos, y],
                    [0, 0, 1],
                ],
                pos: [x, y],
                scale: [1, 1],
                rotation: rotRad,
                radius: r,
                speed: 0
            });
        };
        // Game::AddAsteroid
        Game.prototype.AddAsteroid = function () {
            var sizeAsteroid = 10;
            var x = randomInt(sizeAsteroid, this.ScreenWidth - sizeAsteroid);
            var y = randomInt(sizeAsteroid, this.ScreenWidth - sizeAsteroid);
            var types = "abcd";
            var t = randomInt(0, types.length - 1);
            var s = (randomInt(0, 100) / 100.0) * 5;
            var r = sizeAsteroid / 10.0;
            var rot = randomInt(0, 359);
            var rotRad = rot * Math.PI / 180;
            var sin = Math.sin(rotRad);
            var cos = Math.cos(rotRad);
            var objs = {
                a: [
                    [r * 0, r * 10],
                    [r * 8, r * 6],
                    [r * 10, r * -4],
                    [r * 4, r * -2],
                    [r * 6, r * -6],
                    [r * 0, r * -10],
                    [r * -10, r * -3],
                    [r * -10, r * 5],
                ],
                b: [
                    [r * 0, r * 10],
                    [r * 8, r * 6],
                    [r * 10, r * -4],
                    [r * 4, r * -2],
                    [r * 6, r * -6],
                    [r * 0, r * -10],
                    [r * -8, r * -8],
                    [r * -6, r * -3],
                    [r * -8, r * -4],
                    [r * -10, r * 5],
                ],
                c: [
                    [r * -4, r * 10],
                    [r * 1, r * 8],
                    [r * 7, r * 10],
                    [r * 10, r * -4],
                    [r * 4, r * -2],
                    [r * 6, r * -6],
                    [r * 0, r * -10],
                    [r * -10, r * -3],
                    [r * -10, r * 5],
                ],
                d: [
                    [r * -8, r * 10],
                    [r * 7, r * 8],
                    [r * 10, r * -2],
                    [r * 6, r * -10],
                    [r * -2, r * -8],
                    [r * -6, r * -10],
                    [r * -10, r * -6],
                    [r * -7, r * 0],
                ],
            };
            this.Objects.push({
                objtype: "Asteroid",
                verts: objs[types[t]],
                matrix: [
                    [cos, -sin, x],
                    [sin, cos, y],
                    [0, 0, 1],
                ],
                pos: [x, y],
                scale: [1, 1],
                rotation: rotRad,
                speed: s
            });
        };
        // game::DrawSpaceShip
        Game.prototype.DrawSpaceShip = function (spaceShip) {
            var ctx = this.Ctx;
            var i = 0;
            var outverts = TrasVerts(spaceShip.matrix, spaceShip.verts);
            ctx.strokeStyle = 'rgb(255, 255, 255)';
            ctx.beginPath();
            ctx.moveTo(outverts[0][0], outverts[0][1]);
            for (i = 0; i < outverts.length; i++) {
                ctx.lineTo(outverts[i][0], outverts[i][1]);
            }
            ctx.stroke();
        };
        ;
        // game::DrawAsteroid
        Game.prototype.DrawAsteroid = function (asteroid) {
            var ctx = this.Ctx;
            var i = 0;
            var outverts = TrasVerts(asteroid.matrix, asteroid.verts);
            ctx.strokeStyle = 'rgb(255, 255, 255)';
            ctx.beginPath();
            ctx.moveTo(outverts[0][0], outverts[0][1]);
            for (i = 0; i < outverts.length; i++) {
                ctx.lineTo(outverts[i][0], outverts[i][1]);
            }
            ctx.closePath();
            ctx.stroke();
        };
        ;
        Game.prototype.ApplyTransformToObj = function (obj) {
            var rotRad = obj.rotation;
            var sin = Math.sin(rotRad);
            var cos = Math.cos(rotRad);
            var speed = obj.speed;
            var vel = [-sin * speed, cos * speed];
            var pos = [obj.pos[0], obj.pos[1]];
            pos[0] += vel[0];
            pos[1] += vel[1];
            pos[0] = (pos[0] + this.Canvas.width) % this.Canvas.width;
            pos[1] = (pos[1] + this.Canvas.height) % this.Canvas.height;
            obj.pos = pos;
            obj.speed = speed;
            var s = MakeScale(obj.scale[0], obj.scale[1]);
            var r = MakeRot(obj.rotation);
            var t = MakeTrans(obj.pos[0], obj.pos[1]);
            obj.matrix = MatMult(t, MatMult(s, r));
        };
        // Game::Draw
        Game.prototype.Draw = function () {
            var ctx = this.Ctx;
            // clear last frame
            ctx.fillStyle = 'rgb(100, 100, 100)';
            ctx.fillRect(0, 0, this.Canvas.width, this.Canvas.height);
            this.Objects[0].rotation += (this.ConButtons.dir[0] * 8 * Math.PI) / 180.0;
            this.Objects[0].speed = this.Objects[0].speed + this.ConButtons.dir[1] * 0.25;
            for (var i = 0; i < this.Objects.length; i++) {
                var obj = this.Objects[i];
                this.ApplyTransformToObj(obj);
                obj.outverts = TrasVerts(obj.matrix, obj.verts);
                if (obj.objtype == "Asteroid") {
                    this.DrawAsteroid(obj);
                }
                else if (obj.objtype == "SpaceShip") {
                    this.DrawSpaceShip(obj);
                }
            }
            //render the buffered canvas onto the original canvas element
            this.FrontCtx.drawImage(this.Canvas, 0, 0);
        };
        ;
        Game.prototype.getButtons = function () {
            return this.ConButtons;
        };
        Game.prototype.setButtons = function (b) {
            this.ConButtons = b;
        };
        return Game;
    }());
    function newGame() {
        var gGame = null;
        console.log("myNewAnim");
        var canvas = document.getElementById('canvas');
        if (canvas.getContext) {
            var backcanvas = document.createElement('canvas');
            backcanvas.width = canvas.width;
            backcanvas.height = canvas.height;
            var backctx = backcanvas.getContext('2d');
            var frontctx = canvas.getContext('2d');
            if (gGame === null) {
                console.log("myNewAnim");
                gGame = new Game(canvas, backcanvas, frontctx, backctx);
                var id = setInterval(updateFrame, 60);
            }
        }
        document.addEventListener('keyup', function (event) {
            if (gGame !== null) {
                var b = gGame.getButtons();
                if (event.keyCode == 37) {
                    b.dir[0] = 0; // to left
                }
                else if (event.keyCode == 38) {
                    b.dir[1] = 0; // to right
                }
                else if (event.keyCode == 39) {
                    b.dir[0] = 0; // to right
                }
                else if (event.keyCode == 40) {
                    b.dir[1] = 0; // to down
                }
                else if (event.keyCode == 32) {
                    b.fire = 0; // fire
                }
                gGame.setButtons(b);
            }
        });
        document.addEventListener('keydown', function (event) {
            if (gGame !== null) {
                var b = gGame.getButtons();
                if (event.keyCode == 37) {
                    b.dir[0] = -1; // to left
                }
                else if (event.keyCode == 38) {
                    b.dir[1] = -1; // to up
                }
                else if (event.keyCode == 39) {
                    b.dir[0] = 1; // to right
                }
                else if (event.keyCode == 40) {
                    b.dir[1] = 1; // to down
                }
                else if (event.keyCode == 32) {
                    b.fire = 1; // fire
                }
                gGame.setButtons(b);
            }
        });
        function updateFrame() {
            gGame.Draw();
        }
    }
    asteroids.newGame = newGame;
})(asteroids || (asteroids = {}));
window.onload = function () { asteroids.newGame(); };
//# sourceMappingURL=asteroids.js.map