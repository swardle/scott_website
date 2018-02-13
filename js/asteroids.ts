namespace asteroids {
    function randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function MatMult(a: number[][], b: number[][]): number[][] {
        let r: number[][] = [];
        for (var i = 0; i < a.length; i++) {
            let row: number[] = [0, 0, 0];
            row[0] = b[0][0] * a[i][0] + b[0][1] * a[i][1] + b[0][2] * a[i][2];
            row[1] = b[1][0] * a[i][0] + b[1][1] * a[i][1] + b[1][2] * a[i][2];
            row[2] = b[2][0] * a[i][0] + b[2][1] * a[i][1] + b[2][2] * a[i][2];
            r.push(row);
        }
        return r;
    }

    function MakeTrans(tx: number, ty: number): number[][] {
        var mat = [
            [1, 0, tx],
            [0, 1, ty],
            [0, 0, 1]
        ];
        return mat;
    }

    function MakeRot(rotRad: number): number[][] {
        var sin = Math.sin(rotRad);
        var cos = Math.cos(rotRad);
        var mat = [
            [cos, -sin, 0],
            [sin, cos, 0],
            [0, 0, 1],
        ];
        return mat;
    }

    function MakeScale(sx: number, sy: number): number[][] {
        var mat = [
            [sx, 0, 0],
            [0, sy, 0],
            [0, 0, 1]
        ];
        return mat;
    }

    function TrasVerts(matrix: number[][], verts: number[][]): number[][] {
        let outverts: number[][] = [];
        for (let i: number = 0; i < verts.length; i++) {
            let outvert: number[] = [0, 0];
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
        } else if (discr === 0) {
            return [-0.5 * b / a];
        } else {
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


    class Buttons {
        public dir: number[] = [0, 0];
        public fire: number = 0;
        public start: number = 0;
        constructor() {
        }
    }

    class Bullet {
        public speed: number = 7;
        public lifetime: number = 30;
        constructor(public pos: number[], public dir: number[]) {
        }
    }

    function LineReflection(b: Bullet, HitLoc) {
        // Find where the ball colision happened.                                                                             
        let dir = b.dir;
        let speed = b.speed;
        var colPos = HitLoc.Position;
        // Calulate the reflected vector so we have the new direction.                       
        let vnew = ReflectVector(dir, HitLoc.Normal);

        // From the colision point move the ball away keeping the same speed.                                                                             
        var newPos = [
            colPos[0] + vnew[0] * (speed - HitLoc.Time),
            colPos[1] + vnew[1] * (speed - HitLoc.Time)
        ];

        return { ColPos: colPos, NewPos: newPos, dir: vnew };
    }

    class Game {
        Canvas: HTMLCanvasElement;
        FrontCanvas: HTMLCanvasElement;
        Ctx: CanvasRenderingContext2D;
        FrontCtx: CanvasRenderingContext2D;
        ScreenWidth: number;
        ScreenHeight: number;
        WorldWidth: number;
        WorldHight: number;
        Objects: any[] = [];
        ConButtons: Buttons;
        Buttets: Bullet[];
        Score: number;
        Level: number;

        // Game::Game
        constructor(canvas: HTMLCanvasElement, backcanvas: HTMLCanvasElement,
            frontctx: CanvasRenderingContext2D, backctx: CanvasRenderingContext2D) {
            this.Canvas = backcanvas;
            this.FrontCanvas = canvas;
            this.Ctx = backctx;
            this.FrontCtx = frontctx;
            this.ScreenWidth = canvas.width;
            this.ScreenHeight = canvas.height;
            this.reset();
        }

        reset(reset_type:string = "")
        {
            this.ConButtons = new Buttons;
            this.Buttets = [];
            this.Objects = [];
            this.Objects.push(this.AddSpaceShip());
            this.Objects.push(this.AddAsteroid(20));
            this.Objects.push(this.AddAsteroid(20));
            this.Objects.push(this.AddAsteroid(20));
            if(reset_type === "level_end")
            {

            }
            else{
                this.Score = 0;
                this.Level = 0;
            }
        }

        // game::AddSpaceShip
        AddSpaceShip() {
            let sizeSpaceShip: number = 5;
            let x: number = randomInt(sizeSpaceShip, this.ScreenWidth - sizeSpaceShip);
            let y: number = randomInt(sizeSpaceShip, this.ScreenWidth - sizeSpaceShip);
            let rot: number = randomInt(0, 359);
            let rotRad: number = rot * Math.PI / 180;
            let sin: number = Math.sin(rotRad);
            let cos: number = Math.cos(rotRad);


            return {
                objtype: "SpaceShip",
                verts: [
                    [-1, 1], // left fin
                    [0, -1], // top nose
                    [1, 1], // right fin
                    [.8, .6], // right end flame
                    [-.8, .6], // left end flame
                    [0, 1], // end flame
                    [.8, .6], // left end flame
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
        }

        // Game::AddAsteroid
        AddAsteroid(default_size: number = 0, default_pos: number[] = []) {
            let ship = this.Objects[0];
            let sizetable: number[] = [5, 10, 20];
            let si: number = randomInt(0, sizetable.length - 1);
            let sizeAsteroid: number = sizetable[si];
            if (default_size !== 0) {
                sizeAsteroid = default_size;
            }
            let x: number;
            let y: number;
            if (default_pos.length !== 0) {
                x = default_pos[0];
                y = default_pos[1];
            }
            else{
                while (1) {
                    x = randomInt(sizeAsteroid, this.ScreenWidth - sizeAsteroid);
                    y = randomInt(sizeAsteroid, this.ScreenWidth - sizeAsteroid);
                    let v: number[] = [x - ship.pos[0], y - ship.pos[1]];
                    let vlen: number = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
                    // at least 100 pix away.
                    if (vlen > sizeAsteroid + ship.scale[0] + 100) {
                        break;
                    }
                }
            }
            let types: string = "abcd"
            let ty: number = randomInt(0, types.length - 1);
            let sp: number = (randomInt(30, 100) / 100.0) * 5;
            let rot: number = randomInt(0, 359);
            let rotRad: number = rot * Math.PI / 180;
            let sin: number = Math.sin(rotRad);
            let cos: number = Math.cos(rotRad);

            let objs: any = {
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
        }

        // game::DrawSpaceShip
        DrawSpaceShip(spaceShip) {
            let ctx = this.Ctx;
            let i: number = 0;

            let outverts: number[][] = TrasVerts(spaceShip.matrix, spaceShip.verts);
            ctx.strokeStyle = 'rgb(255, 255, 255)';
            ctx.beginPath();
            ctx.moveTo(outverts[0][0], outverts[0][1]);
            for (i = 0; i < outverts.length; i++) {
                ctx.lineTo(outverts[i][0], outverts[i][1]);
            }
            ctx.stroke();
        };


        // game::DrawAsteroid
        DrawAsteroid(asteroid) {
            let ctx = this.Ctx;
            let i: number = 0;

            let outverts: number[][] = TrasVerts(asteroid.matrix, asteroid.verts);
            ctx.strokeStyle = 'rgb(255, 255, 255)';
            ctx.beginPath();
            ctx.moveTo(outverts[0][0], outverts[0][1]);
            for (i = 0; i < outverts.length; i++) {
                ctx.lineTo(outverts[i][0], outverts[i][1]);
            }
            ctx.closePath();
            ctx.stroke();
        };

        updateBullets() {
            let width: number = this.Canvas.width;
            let height: number = this.Canvas.height;
            // move bullets
            for (let i: number = 0; i < this.Buttets.length; i++) {
                let b: Bullet = this.Buttets[i];
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
        }
        shipVsAsteroids() {
            let ship = this.Objects[0];
            for (let j: number = 1; j < this.Objects.length; j++) {
                let obj = this.Objects[j];
                if (obj.objtype === "Asteroid") {
                    // find the disance between ship and asteroid
                    // is within the asteroid radius + ship radius
                    let v: number[] = [obj.pos[0] - ship.pos[0], obj.pos[1] - ship.pos[1]];
                    let vlen: number = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
                    if (vlen < obj.scale[0] + ship.scale[0]) {
                        ship.dead = true;
                    }
                }
            }
        }

        bulletsVsAsteroids() {
            var ctx = this.Ctx;
            //let newbullets:Bullet[] = [];
            let newobjs = []
            // Test bullets vs objtype = Asteroid
            for (let i: number = 0; i < this.Buttets.length; i++) {
                let b: Bullet = this.Buttets[i];
                for (let j: number = 0; j < this.Objects.length; j++) {
                    let obj = this.Objects[j];
                    if (obj.objtype === "Asteroid") {
                        // probably a bug here some times ray get inside asteroid
                        // should be a polygon test anyways. 
                        // I think the problem is the asteroid is moving forward. 
                        // so it should be pill like colision test. 
                        // wrap around also casues a problem.
                        let hits = RayVsBall(b.pos, b.dir, obj.pos, obj.scale[0]);
                        for (let k: number = 0; k < hits.length; k++) {
                            let HitLoc = hits[k];
                            if (HitLoc.Time <= b.speed) {
                                this.Score += 1;
                                this.Objects.splice(j, 1);
                                if (obj.scale[0] > 5) {
                                    newobjs.push(this.AddAsteroid(obj.scale[0] / 2, obj.pos));
                                    newobjs.push(this.AddAsteroid(obj.scale[0] / 2, obj.pos));
                                    newobjs.push(this.AddAsteroid(obj.scale[0] / 2, obj.pos));
                                }
                                b.lifetime = 0

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
        }


        drawBullets() {
            let ctx = this.Ctx;
            ctx.strokeStyle = 'rgb(255, 255, 255)';
            ctx.beginPath();
            for (let b of this.Buttets) {
                ctx.moveTo(b.pos[0], b.pos[1]);
                ctx.lineTo(b.pos[0] + b.dir[0] * b.speed, b.pos[1] + b.dir[1] * b.speed);
            }
            ctx.closePath();
            ctx.stroke();
        }

        ApplyTransformToObj(obj) {

            var rotRad = obj.rotation;
            var sin = Math.sin(rotRad);
            var cos = Math.cos(rotRad);
            let speed = obj.speed;
            let vel: number[] = [-sin * speed, cos * speed];
            let pos: number[] = [obj.pos[0], obj.pos[1]];
            pos[0] += vel[0];
            pos[1] += vel[1];

            pos[0] = (pos[0] + this.Canvas.width) % this.Canvas.width;
            pos[1] = (pos[1] + this.Canvas.height) % this.Canvas.height;
            obj.pos = pos;
            obj.speed = speed;

            let s: number[][] = MakeScale(obj.scale[0], obj.scale[1]);
            let r: number[][] = MakeRot(obj.rotation);
            let t: number[][] = MakeTrans(obj.pos[0], obj.pos[1]);
            obj.matrix = MatMult(t, MatMult(s, r));
        }


        // Game::Draw
        Draw(): void {
            var ctx = this.Ctx;

            // clear last frame
            ctx.fillStyle = 'rgb(100, 100, 100)';
            ctx.fillRect(0, 0, this.Canvas.width, this.Canvas.height);

            let ship = this.Objects[0];
            if (!ship.dead && this.Objects.length > 1) {
                let el: HTMLElement = document.getElementById("scoreboard");
                if (el) {
                    el.innerText = "Score: "+this.Score+" Level: " + this.Level + "\n";
                }
                ship.rotation += (this.ConButtons.dir[0] * 8 * Math.PI) / 180.0;
                ship.speed = ship.speed + this.ConButtons.dir[1] * 0.25;
                if (this.ConButtons.fire) {
                    var rotRad = ship.rotation;
                    var sin = Math.sin(rotRad);
                    var cos = Math.cos(rotRad);
                    this.Buttets.push(new Bullet(ship.pos, [sin, -cos]));
                }

                for (let i: number = 0; i < this.Objects.length; i++) {
                    let obj = this.Objects[i];
                    this.ApplyTransformToObj(obj);
                    obj.outverts = TrasVerts(obj.matrix, obj.verts);

                    if (obj.objtype === "Asteroid") {
                        this.DrawAsteroid(obj);
                    } else if (obj.objtype === "SpaceShip" && obj.dead === false) {
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
            else if (ship.dead && this.Objects.length > 1) {
                let el: HTMLElement = document.getElementById("scoreboard");
                if (el) {
                    el.innerText = "Score: " + this.Score + " Level: " + this.Level + "\n" +                    
                    "press s to start";
                }
                if (this.ConButtons.start) {
                    this.reset();
                    ship = this.Objects[0];
                    ship.dead = false;
                }
            }
            else if (this.Objects.length <= 1)
            {
                let el: HTMLElement = document.getElementById("scoreboard");
                if (el) {
                    el.innerText = "Score: " + this.Score + " Level: " + this.Level + "\n" +
                    "level over press s to start next level";
                }
                if (this.ConButtons.start) {
                    this.Level += 1;
                    this.reset("level_end");
                    ship = this.Objects[0];
                    ship.dead = false;
                }                
            }

            //render the buffered canvas onto the original canvas element
            this.FrontCtx.drawImage(this.Canvas, 0, 0);
        };

        getButtons(): Buttons {
            return this.ConButtons;
        }

        setButtons(b: Buttons): void {
            this.ConButtons = b;
        }
    }

    export function newGame() {
        let gGame: Game = null;
        console.log("myNewAnim");
        let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('canvas');
        if (canvas.getContext) {
            let backcanvas: HTMLCanvasElement = document.createElement('canvas');
            backcanvas.width = canvas.width;
            backcanvas.height = canvas.height;
            let backctx: CanvasRenderingContext2D = backcanvas.getContext('2d');
            let frontctx: CanvasRenderingContext2D = canvas.getContext('2d');

            if (gGame === null) {
                console.log("myNewAnim");
                gGame = new Game(canvas, backcanvas, frontctx, backctx);
                let id = setInterval(updateFrame, 60);
            }
        }

        document.addEventListener('keyup', function (event) {
            if (gGame !== null) {
                let b: Buttons = gGame.getButtons();
                if (event.keyCode == 37) {
                    b.dir[0] = 0; // to left
                } else if (event.keyCode == 38) {
                    b.dir[1] = 0; // to right
                } else if (event.keyCode == 39) {
                    b.dir[0] = 0; // to right
                } else if (event.keyCode == 40) {
                    b.dir[1] = 0; // to down
                } else if (event.keyCode == 32) {
                    b.fire = 0; // fire
                } else if (event.keyCode == 83) {
                    b.start = 0; // start s key
                }
                gGame.setButtons(b);
            }
        });

        document.addEventListener('keydown', function (event) {
            if (gGame !== null) {
                let b: Buttons = gGame.getButtons();
                if (event.keyCode == 37) {
                    b.dir[0] = -1; // to left
                } else if (event.keyCode == 38) {
                    b.dir[1] = -1; // to up
                } else if (event.keyCode == 39) {
                    b.dir[0] = 1; // to right
                } else if (event.keyCode == 40) {
                    b.dir[1] = 1; // to down
                } else if (event.keyCode == 32) {
                    b.fire = 1; // fire
                } else if (event.keyCode == 83) {
                    b.start = 1; // start s key
                }
                gGame.setButtons(b);
            }
        });

        function updateFrame() {
            gGame.Draw();
        }
    }

}

window.onload = () => { asteroids.newGame(); }