namespace asteroids {
    function randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    // lerp between v0 when t=0 and v1 when t=1
    function lerp(v0: number, v1: number, t: number): number {
        return (1 - t) * v0 + t * v1;
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

    function MakeRot(rot: number): number[][] {
        var rotRad = rot * Math.PI / 180;
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

    // from http://www.cg.info.hiroshima-cu.ac.jp/~miyazaki/knowledge/teche23.html
    // https://ardoris.wordpress.com/2008/07/18/general-formula-for-the-inverse-of-a-3x3-matrix/
    function MatInverse(m: number[][]): number[][] {
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

    function ApplyTransformToObj(obj) {
        let s: number[][] = MakeScale(obj.scale[0], obj.scale[1]);
        let r: number[][] = MakeRot(obj.rotation);
        let t: number[][] = MakeTrans(obj.pos[0], obj.pos[1]);
        obj.matrix = MatMult(t, MatMult(s, r));
    }

    class Buttons {
        public dir: number[] = [0, 0];
        public fire: number = 0;
        constructor() {
            this.dir = [0,0];
            this.fire = 0;
        }
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
        PlayerVelocityX: number = 0;
        PlayerVelocityY: number = 0;
        Objects: any[] = [];
        ConButtons: Buttons;

        // Game::Game
        constructor(canvas: HTMLCanvasElement, backcanvas: HTMLCanvasElement,
            frontctx: CanvasRenderingContext2D, backctx: CanvasRenderingContext2D) {
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

        AddSpaceShip(): void {
            let sizeSpaceShip: number = 10;
            let x: number = randomInt(sizeSpaceShip, this.ScreenWidth - sizeSpaceShip);
            let y: number = randomInt(sizeSpaceShip, this.ScreenWidth - sizeSpaceShip);
            let rot: number = randomInt(0, 359);
            let r: number = sizeSpaceShip / 5.0;
            let rotRad: number = rot * Math.PI / 180;
            let sin: number = Math.sin(rotRad);
            let cos: number = Math.cos(rotRad);

            this.Objects.push({
                objtype: "SpaceShip",
                verts: [
                    [-5, 5], // left fin
                    [0, -5], // top nose
                    [5, 5], // right fin
                    [4, 3], // right end flame
                    [-4, 3], // left end flame
                    [0, 6], // end flame
                    [4, 3], // left end flame
                ],
                matrix: [
                    [cos, -sin, x],
                    [sin, cos, y],
                    [0, 0, 1],
                ],
                pos: [x, y],
                scale: [1, 1],
                rotation: rot,
                radius: r,
            });
        }

        // Game::AddAsteroid
        AddAsteroid(): void {
            let sizeAsteroid: number = 10;
            let x: number = randomInt(sizeAsteroid, this.ScreenWidth - sizeAsteroid);
            let y: number = randomInt(sizeAsteroid, this.ScreenWidth - sizeAsteroid);
            let types: string = "abcd"
            let t: number = randomInt(0, types.length - 1);
            let r: number = sizeAsteroid / 10.0;

            let objs: any = {
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
                    [1, 0, x],
                    [0, 1, y],
                    [0, 0, 1],
                ],
                pos: [x, y],
                scale: [1, 1],
                rotation: 0,
            });
        }

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

        // Game::Draw
        Draw(): void {
            var ctx = this.Ctx;

            // clear last frame
            ctx.fillStyle = 'rgb(100, 100, 100)';
            ctx.fillRect(0, 0, this.Canvas.width, this.Canvas.height);

            this.Objects[0].pos[0] += this.ConButtons.dir[0];
            this.Objects[0].pos[1] += this.ConButtons.dir[1];

            for (let i: number = 0; i < this.Objects.length; i++) {
                let obj = this.Objects[i];
                ApplyTransformToObj(obj);
                obj.outverts = TrasVerts(obj.matrix, obj.verts);

                if (obj.objtype == "Asteroid") {
                    this.DrawAsteroid(obj);
                } else if (obj.objtype == "SpaceShip") {
                    this.DrawSpaceShip(obj);
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
