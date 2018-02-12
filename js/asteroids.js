var asteroids;
(function (asteroids) {
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
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
    // return a normal from a line
    function Normalize(a) {
        // clone the vector
        var l = a.slice();
        var llen = Math.sqrt(l[0] * l[0] + l[1] * l[1]);
        var oollen = 1.0 / llen;
        l[0] = l[0] * oollen;
        l[1] = l[1] * oollen;
        return l;
    }
    // dot 2 vectors a and b
    function Dot(a, b) {
        return a[0] * b[0] + a[1] * b[1];
    }
    function VectorSub(a, b) {
        return [a[0] - b[0], a[1] - b[1]];
    }
    // x = -b +- sqrt(b^2 - 4ac)
    //     ---------------------
    //             2a  
    function solveQuadratic(a, b, c) {
        var x0;
        var x1;
        var discr = b * b - 4 * a * c;
        if (discr < 0) {
            return [];
        }
        else if (discr === 0) {
            return [-0.5 * b / a];
        }
        else {
            var q = (b > 0) ?
                -0.5 * (b + Math.sqrt(discr)) :
                -0.5 * (b - Math.sqrt(discr));
            x0 = q / a;
            x1 = c / q;
        }
        if (x0 > x1) {
            var tmp = x0;
            x0 = x1;
            x1 = tmp;
        }
        return [x0, x1];
    }
    // Line a vs ball b
    // {IsHit=false, Normal=side, Time=t}
    // Circle: abs(x-c)^2 = r^2
    // Line: x = o + dl
    // replace x with o + dl 
    // abs(o + dl-c)^2 = r^2
    // (o + dl-c)*(o + dl-c) = r^2
    // o^2 + odl - oc + odl + dl^2 - dlc - oc - dlc + c^2 = r^2
    // d^2(l*l) + 2*odl - 2*dlc - oc + c^2 + o^2 - oc = r^2
    // d^2(l*l) + 2*d((l)*(o - c)) + c^2 - oc + o^2 - oc = r^2
    // d^2(l*l) + 2*d((l)*(o - c)) + c(c - o) - o(c - o) = r^2
    // d^2(l*l) + 2*d((l)*(o - c)) + (c-o)(c-o) = r^2
    // d^2(l*l) + 2*d((l)*(o - c)) + (c-o)(c-o) = r^2
    // d^2(l*l) + 2*d((l)*(o - c)) + (c-o)(c-o) - r^2 = 0
    // Solve for d using Quadratic formula
    // 
    // x = -b +- sqrt(b^2 - 4ac)
    //     ---------------------
    //             2a  
    // Where d will be x
    // a = (l*l)
    // b = ((l)*(o - c))
    // c = ((c-o)(c-o)-r^2)
    // 
    // x = -((l)*(o - c)) +- sqrt(((l)*(o - c))^2 - 4(l*l)((c-o)(c-o)-r^2)
    //       -------------------------------------------------------
    //                 2(l*l)
    //
    // orig of ray
    // dir of ray
    // center of sphere
    // radius of sphere
    function RayVsBall(orig, dir, center, radius) {
        var L = VectorSub(orig, center);
        var a = Dot(dir, dir);
        var b = 2 * Dot(dir, L);
        var c = Dot(L, L) - radius * radius;
        var solutions = solveQuadratic(a, b, c);
        var hits = [];
        for (var i = 0; i < solutions.length; i++) {
            var s = solutions[i];
            if (s > 0) {
                var colPos = [orig[0] + dir[0] * s, orig[1] + dir[1] * s];
                var n = VectorSub(colPos, center);
                n = Normalize(n);
                var hit = { Position: colPos, Normal: n, Time: s };
                hits.push(hit);
            }
        }
        return hits;
    }
    // d is a vector
    // n is the normal of the vector to reflect over
    //
    // Vnew = ( -2*(V dot N)*N + V )
    function ReflectVector(d, n) {
        var dn = -2 * Dot(d, n);
        var vnew = [dn * n[0] + d[0], dn * n[1] + d[1]];
        return vnew;
    }
    var Buttons = /** @class */ (function () {
        function Buttons() {
            this.dir = [0, 0];
            this.fire = 0;
            this.start = 0;
        }
        return Buttons;
    }());
    var Bullet = /** @class */ (function () {
        function Bullet(pos, dir) {
            this.pos = pos;
            this.dir = dir;
            this.speed = 7;
            this.lifetime = 30;
        }
        return Bullet;
    }());
    function LineReflection(b, HitLoc) {
        // Find where the ball colision happened.                                                                             
        var dir = b.dir;
        var speed = b.speed;
        var colPos = HitLoc.Position;
        // Calulate the reflected vector so we have the new direction.                       
        var vnew = ReflectVector(dir, HitLoc.Normal);
        // From the colision point move the ball away keeping the same speed.                                                                             
        var newPos = [
            colPos[0] + vnew[0] * (speed - HitLoc.Time),
            colPos[1] + vnew[1] * (speed - HitLoc.Time)
        ];
        return { ColPos: colPos, NewPos: newPos, dir: vnew };
    }
    var Game = /** @class */ (function () {
        // Game::Game
        function Game(canvas, backcanvas, frontctx, backctx) {
            this.Objects = [];
            this.Buttets = [];
            this.Canvas = backcanvas;
            this.FrontCanvas = canvas;
            this.Ctx = backctx;
            this.FrontCtx = frontctx;
            this.ScreenWidth = canvas.width;
            this.ScreenHeight = canvas.height;
            this.ConButtons = new Buttons;
            this.Objects = [];
            this.Objects.push(this.AddSpaceShip());
            this.Objects.push(this.AddAsteroid(20));
            this.Objects.push(this.AddAsteroid(20));
            this.Objects.push(this.AddAsteroid(20));
        }
        // game::AddSpaceShip
        Game.prototype.AddSpaceShip = function () {
            var sizeSpaceShip = 5;
            var x = randomInt(sizeSpaceShip, this.ScreenWidth - sizeSpaceShip);
            var y = randomInt(sizeSpaceShip, this.ScreenWidth - sizeSpaceShip);
            var rot = randomInt(0, 359);
            var rotRad = rot * Math.PI / 180;
            var sin = Math.sin(rotRad);
            var cos = Math.cos(rotRad);
            return {
                objtype: "SpaceShip",
                verts: [
                    [-1, 1],
                    [0, -1],
                    [1, 1],
                    [.8, .6],
                    [-.8, .6],
                    [0, 1],
                    [.8, .6],
                ],
                matrix: [
                    [cos, -sin, x],
                    [sin, cos, y],
                    [0, 0, 1],
                ],
                pos: [x, y],
                scale: [5, 5],
                rotation: rotRad,
                speed: 0,
                dead: false
            };
        };
        // Game::AddAsteroid
        Game.prototype.AddAsteroid = function (default_size, default_pos) {
            if (default_size === void 0) { default_size = 0; }
            if (default_pos === void 0) { default_pos = []; }
            var sizetable = [5, 10, 20];
            var si = randomInt(0, sizetable.length - 1);
            var sizeAsteroid = sizetable[si];
            if (default_size !== 0) {
                sizeAsteroid = default_size;
            }
            var x = randomInt(sizeAsteroid, this.ScreenWidth - sizeAsteroid);
            var y = randomInt(sizeAsteroid, this.ScreenWidth - sizeAsteroid);
            if (default_pos.length !== 0) {
                x = default_pos[0];
                y = default_pos[1];
            }
            var types = "abcd";
            var ty = randomInt(0, types.length - 1);
            var sp = (randomInt(30, 100) / 100.0) * 5;
            var rot = randomInt(0, 359);
            var rotRad = rot * Math.PI / 180;
            var sin = Math.sin(rotRad);
            var cos = Math.cos(rotRad);
            var objs = {
                a: [[0, 1], [.8, .6], [1, -.4], [.4, -.2], [.6, -.6], [0, -1], [-1, -.3], [-1, .5]],
                b: [[0, 1], [.8, .6], [1, -.4], [.4, -.2], [.6, -.6], [0, -1], [-.8, -.8], [-.6, -.3], [-.8, -.4], [-1, .5]],
                c: [[-.4, 1], [.1, .8], [.7, 1], [1, -.4], [.4, -.2], [.6, -.6], [0, -1], [-1, -.3], [-1, .5]],
                d: [[-.8, 1], [.7, .8], [1, -.2], [.6, -1], [-.2, -.8], [-.6, -1], [-1, -.6], [-.7, 0]],
            };
            return {
                objtype: "Asteroid",
                verts: objs[types[ty]],
                matrix: [
                    [cos, -sin, x],
                    [sin, cos, y],
                    [0, 0, 1],
                ],
                pos: [x, y],
                scale: [sizeAsteroid, sizeAsteroid],
                rotation: rotRad,
                speed: sp,
                dead: false
            };
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
        Game.prototype.updateBullets = function () {
            var width = this.Canvas.width;
            var height = this.Canvas.height;
            // move bullets
            for (var i = 0; i < this.Buttets.length; i++) {
                var b = this.Buttets[i];
                b.lifetime -= 1;
                if (b.lifetime < 0) {
                    this.Buttets.splice(i, 1);
                }
                else {
                    b.pos[0] += b.dir[0] * b.speed;
                    b.pos[1] += b.dir[1] * b.speed;
                    // wrap around
                    b.pos[0] = (b.pos[0] + width) % width;
                    b.pos[1] = (b.pos[1] + height) % height;
                }
            }
        };
        Game.prototype.shipVsAsteroids = function () {
            var ship = this.Objects[0];
            for (var j = 1; j < this.Objects.length; j++) {
                var obj = this.Objects[j];
                if (obj.objtype === "Asteroid") {
                    // find the disance between ship and asteroid
                    // is within the asteroid radius + ship radius
                    var v = [obj.pos[0] - ship.pos[0], obj.pos[1] - ship.pos[1]];
                    var vlen = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
                    if (vlen < obj.scale[0] + ship.scale[0]) {
                        ship.dead = true;
                    }
                }
            }
        };
        Game.prototype.bulletsVsAsteroids = function () {
            var ctx = this.Ctx;
            //let newbullets:Bullet[] = [];
            var newobjs = [];
            // Test bullets vs objtype = Asteroid
            for (var i = 0; i < this.Buttets.length; i++) {
                var b = this.Buttets[i];
                for (var j = 0; j < this.Objects.length; j++) {
                    var obj = this.Objects[j];
                    if (obj.objtype === "Asteroid") {
                        // probably a bug here some times ray get inside asteroid
                        // should be a polygon test anyways. 
                        // I think the problem is the asteroid is moving forward. 
                        // so it should be pill like colision test. 
                        // wrap around also casues a problem.
                        var hits = RayVsBall(b.pos, b.dir, obj.pos, obj.scale[0]);
                        for (var k = 0; k < hits.length; k++) {
                            var HitLoc = hits[k];
                            if (HitLoc.Time <= b.speed) {
                                this.Objects.splice(j, 1);
                                if (obj.scale[0] > 5) {
                                    newobjs.push(this.AddAsteroid(obj.scale[0] / 2, obj.pos));
                                    newobjs.push(this.AddAsteroid(obj.scale[0] / 2, obj.pos));
                                    newobjs.push(this.AddAsteroid(obj.scale[0] / 2, obj.pos));
                                }
                                b.lifetime = 0;
                                // fun boncing bullets tests. 
                                /*
                                let ColData = LineReflection(b, HitLoc);
                                ctx.strokeStyle = 'rgb(200, 200, 0)';
                                ctx.beginPath();
                                ctx.moveTo(ColData.ColPos[0], ColData.ColPos[1]);
                                ctx.lineTo(ColData.NewPos[0], ColData.NewPos[1]);
                                ctx.stroke();

                                newbullets.push(new Bullet(ColData.NewPos, ColData.dir));
                                newbullets[newbullets.length - 1].lifetime = b.lifetime;
                                b.lifetime = 0
                                */
                            }
                        }
                    }
                }
            }
            //this.Buttets = this.Buttets.concat(newbullets);
            this.Objects = this.Objects.concat(newobjs);
        };
        Game.prototype.drawBullets = function () {
            var ctx = this.Ctx;
            ctx.strokeStyle = 'rgb(255, 255, 255)';
            ctx.beginPath();
            for (var _i = 0, _a = this.Buttets; _i < _a.length; _i++) {
                var b = _a[_i];
                ctx.moveTo(b.pos[0], b.pos[1]);
                ctx.lineTo(b.pos[0] + b.dir[0] * b.speed, b.pos[1] + b.dir[1] * b.speed);
            }
            ctx.closePath();
            ctx.stroke();
        };
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
            var ship = this.Objects[0];
            if (!ship.dead) {
                var el = document.getElementById("scoreboard");
                if (el) {
                    el.innerText = "Score:";
                }
                ship.rotation += (this.ConButtons.dir[0] * 8 * Math.PI) / 180.0;
                ship.speed = ship.speed + this.ConButtons.dir[1] * 0.25;
                if (this.ConButtons.fire) {
                    var rotRad = ship.rotation;
                    var sin = Math.sin(rotRad);
                    var cos = Math.cos(rotRad);
                    this.Buttets.push(new Bullet(ship.pos, [sin, -cos]));
                }
                for (var i = 0; i < this.Objects.length; i++) {
                    var obj = this.Objects[i];
                    this.ApplyTransformToObj(obj);
                    obj.outverts = TrasVerts(obj.matrix, obj.verts);
                    if (obj.objtype === "Asteroid") {
                        this.DrawAsteroid(obj);
                    }
                    else if (obj.objtype === "SpaceShip" && obj.dead === false) {
                        this.DrawSpaceShip(obj);
                    }
                }
                this.updateBullets();
                this.drawBullets();
                this.bulletsVsAsteroids();
                this.shipVsAsteroids();
                if (this.ConButtons.start) {
                    ship.dead = false;
                    ship.speed = 0;
                    this.Objects.splice(1, this.Objects.length - 1);
                    this.Objects.push(this.AddAsteroid(20));
                    this.Objects.push(this.AddAsteroid(20));
                    this.Objects.push(this.AddAsteroid(20));
                }
            }
            else {
                var el = document.getElementById("scoreboard");
                if (el) {
                    el.innerText = "press s to start";
                }
                if (this.ConButtons.start) {
                    ship.dead = false;
                    ship.speed = 0;
                    this.Objects.splice(1, this.Objects.length - 1);
                    this.Objects.push(this.AddAsteroid(20));
                    this.Objects.push(this.AddAsteroid(20));
                    this.Objects.push(this.AddAsteroid(20));
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
                else if (event.keyCode == 83) {
                    b.start = 0; // start s key
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
                else if (event.keyCode == 83) {
                    b.start = 1; // start s key
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