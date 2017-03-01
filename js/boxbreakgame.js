var gPlayerSpeed = 8;
var gBallSpeed = 8;
// x,y,width,hieght
var gInitBallBox = [8, 128, 3, 3];
var gInitPlayerBox = [0, 256 - 4, 16, 4];
var gInitField0Box = [0, 0, 16, 4];


function Box(x, y, width, height) {
    this.X = x;
    this.Y = y;
    this.Width = width;
    this.Height = height;
}

function BoxFromArray(boxarray) {
    this.X = boxarray[0];
    this.Y = boxarray[1];
    this.Width = boxarray[2];
    this.Height = boxarray[3];
}

function Line(x1, y1, x2, y2) {
    this.X1 = x1;
    this.Y1 = y1;
    this.X2 = x2;
    this.Y2 = y2;
}

function LineFromArray(linearray) {
    this.X1 = linearray[0];
    this.Y1 = linearray[1];
    this.X2 = linearray[2];
    this.Y2 = linearray[3];
}


// return a normal from a line
function NormalizeLine(a) {
    // a normal 
    var l = [a.X1 - a.X2, a.Y1 - a.Y2];
    var llen = Math.sqrt(l[0] * l[0] + l[1] * l[1]);
    var oollen = 1.0 / llen;
    l[0] = l[0] * oollen;
    l[1] = l[1] * oollen;
    return l;
}

// return a normal from a line
function Normalize(a) {
    // a normal 
    var l = a;
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

// d is a vector
// n is the normal of the vector to reflect over
//
// Vnew = ( -2*(V dot N)*N + V )
function ReflectVector(d, n) {
    var dn = -2 * Dot(d, n);
    var vnew = [dn * n[0] + d[0], dn * n[1] + d[1]];
    return vnew;
}

// Line a vs box b
// {IsHit=false, Normal=side, Time=t}
function LineVsBox(a, b) {
    var rdir = NormalizeLine(a);
    var dfx = 90000.0;
    var dfy = 90000.0;
    if (Math.abs(rdir[0]) > 0.0001) {
        dfx = 1.0 / rdir[0];
    }
    if (Math.abs(rdir[1]) > 0.0001) {
        dfy = 1.0 / rdir[1];
    }

    // time to hit left, right, bottom, top
    var t1 = (b.X - a.X2) * dfx;
    var t2 = (b.X + b.Width - a.X2) * dfx;
    var t3 = (b.Y + b.Height - a.Y2) * dfy;
    var t4 = (b.Y - a.Y2) * dfy;

    var xside = [0, 0];
    var yside = [0, 0];
    var side = [0, 0];
    var tmin;
    var tmax;
    var xmin;
    var ymin;
    var xmax;
    var ymax;

    // See if the left closer then the right
    if (t1 < t2) {
        xside = [-1, 0]; // left
        xmin = t1;
        xmax = t2;
    } else {
        xside = [1, 0]; // right
        xmin = t2;
        xmax = t1;
    }


    // See if the bottom closer then the top
    if (t3 < t4) {
        yside = [0, 1]; // bottom 
        ymin = t3;
        ymax = t4;
    } else {
        yside = [0, -1]; // top
        ymin = t4;
        ymax = t3;
    }

    // See if the side hit before top or bottom
    if (xmin > ymin) {
        side = xside;
        tmin = xmin;
    } else {
        side = yside;
        tmin = ymin;
    }

    // see what was hit last top/bottom vs sides
    if (xmax < ymax) {
        tmax = xmax;
    } else {
        tmax = ymax;
    }

    var tmin2 = Math.max(Math.min(t1, t2), Math.min(t3, t4));
    var tmax2 = Math.min(Math.max(t1, t2), Math.max(t3, t4));

    var testmin = tmin == tmin2;
    var testmax = tmax == tmax2;

    if (!testmin || !testmax) {
        console.log("error");
    }

    // if tmax < 0, ray (line) is intersecting AABB, but whole AABB is behing us
    if (tmax < 0) {
        t = tmax;
        return { IsHit: false, Normal: side, Time: 0.0 };
    }

    // if tmin > tmax, ray doesn't intersect AABB
    if (tmin > tmax) {
        t = tmax;
        return { IsHit: false, Normal: side, Time: 0.0 };
    }

    t = tmin;
    return { IsHit: true, Normal: side, Time: t };
}

// if box b is touching box a return true
//
// if left point of b is within a or a is within b    
// if top point of b is within a or  a is within b    
//
function BoxInBoxTest(a, b) {
    if ((a.X <= b.X && a.X + a.Width > b.X ||
            b.X <= a.X && b.X + b.Width > a.X) &&
        (a.Y <= b.Y && a.Y + a.Height > b.Y ||
            b.Y <= a.Y && b.Y + b.Height > a.Y)
    ) {
        return true;
    }
    return false;
}

// function BoxTestTest()
// {
//  var a = [
//     [ new Box(0,0,10,10),    new Box(0,0,10,10),  true  ],   
//     [ new Box(1,0,10,10),    new Box(0,0,10,10),  true  ],   
//     [ new Box(9,0,10,10),    new Box(0,0,10,10),  true  ],   
//     [ new Box(10,0,10,10),   new Box(0,0,10,10),  false ],   
//     [ new Box(11,0,10,10),   new Box(0,0,10,10),  false ],   
//     [ new Box(0,0,10,10),    new Box(1,0,10,10),  true  ],   
//     [ new Box(0,0,10,10),    new Box(9,0,10,10),  true  ],   
//     [ new Box(0,0,10,10),    new Box(10,0,10,10), false ],   
//     [ new Box(0,0,10,10),    new Box(11,0,10,10), false ],   
//     [ new Box(20,0,10,10),   new Box(20,0,10,10), true  ],   
//     [ new Box(20,0,10,10),   new Box(19,0,10,10), true  ],   
//     [ new Box(20,0,10,10),   new Box(11,0,10,10), true  ],   
//     [ new Box(20,0,10,10),   new Box(10,0,10,10), false ],   
//     [ new Box(20,0,10,10),   new Box(9,0,10,10),  false ],   
//     [ new Box(20,0,10,10),   new Box(8,0,10,10),  false ],   
//     [ new Box(20,0,10,10),   new Box(20,0,10,10), true  ],   
//     [ new Box(19,0,10,10),   new Box(20,0,10,10), true  ],   
//     [ new Box(11,0,10,10),   new Box(20,0,10,10), true  ],   
//     [ new Box(10,0,10,10),   new Box(20,0,10,10), false ],   
//     [ new Box(9,0,10,10),    new Box(20,0,10,10), false ],   
//     [ new Box(8,0,10,10),    new Box(20,0,10,10), false ],   
//  ]
//  for (var i = 0; i < a.length; ++i) {
//      var test = BoxInBoxTest(a[i][0], a[i][1]) == a[i][2];
//      console.log(""+i+" "+test);
//  }
// }
// BoxTestTest();

function Game(canvas, backcanvas, frontctx, backctx) {
    this.Canvas = backcanvas;
    this.FrontCanvas = canvas;
    this.Ctx = backctx;
    this.FrontCtx = frontctx;
    this.ScreenWidth = canvas.width;
    this.ScreenHeight = canvas.height;
    this.WorldWidth = 512;
    this.WorldHight = 256;
    this.PlayerVelocityX = 0;
    this.PlayerVelocityY = 0;
    this.BallVelocityX = 0;
    this.BallVelocityY = gBallSpeed;
    this.BallOldPos = [gInitBallBox[0], gInitBallBox[1]-gBallSpeed];
    this.WorldBox = new BoxFromArray([0,0,this.WorldWidth,this.WorldHight]);
    this.Ball = new BoxFromArray(gInitBallBox);
    this.Player = new BoxFromArray(gInitPlayerBox);
    this.Field0Box = new BoxFromArray(gInitField0Box);
    this.BallHit = false;
    this.Field = [];
    for (var i = 0; i < 8; i++) {
        var temp = [];
        for (var j = 0; j < 32; j++) {
            temp.push(1);
        }
        this.Field.push(temp);
    }
}

Game.prototype.RightButton = function() {
    this.PlayerVelocityX = gPlayerSpeed;
    this.Player.X += gPlayerSpeed;
    if (this.Player.X + this.Player.Width > this.WorldWidth) {
        this.Player.X = this.WorldWidth - this.Player.Width;
    }
    console.log("RightButton Key");
};

Game.prototype.LeftButton = function() {
    this.PlayerVelocityX = -gPlayerSpeed;
    this.Player.X -= gPlayerSpeed;
    if (this.Player.X < 0) {
        this.Player.X = 0;
    }
    console.log("LeftButton Key");
};


Game.prototype.Reset = function() {
    this.BallOldPos = [gInitBallBox[0], gInitBallBox[1] - gBallSpeed];
    this.Ball = new BoxFromArray(gInitBallBox);
    this.BallVelocityX = 0;
    this.BallVelocityY = gBallSpeed;
    this.Field = [];
    for (var i = 0; i < 8; i++) {
        var temp = [];
        for (var j = 0; j < 32; j++) {
            temp.push(1);
        }
        this.Field.push(temp);
    }
    console.log("Reset Key");

};
Game.prototype.Draw = function() {
    var ctx = this.Ctx;

    // clear last frame
    ctx.fillStyle = 'rgb(200, 200, 200)';
    ctx.fillRect(0, 0, this.Canvas.width, this.Canvas.height);

    // Draw Player 
    ctx.fillStyle = 'rgb(0, 200, 0)';
    ctx.fillRect(this.Player.X, this.Player.Y, this.Player.Width, this.Player.Height);

    var bx = 0;
    var by = 0;
    var a = null;
    var hitloc = null;
    var ballv = 0;
    var vnew = 0;
    var balldir = 0;
    var justBeforeHit = 0;
    var colBallPos = [0, 0, 0, 0];


    // Draw Field
    ctx.fillStyle = 'rgb(200, 0, 0)';
    for (by = 0; by < this.Field.length; by++) {
        row = this.Field[by];
        var y = this.Field0Box.Y + by * this.Field0Box.Height;
        for (bx = 0; bx < row.length; bx++) {
            if (row[bx] == 1) {
                var x = this.Field0Box.X + bx * this.Field0Box.Width;
                ctx.fillRect(x, y, this.Field0Box.Width, this.Field0Box.Height);
            }
        }
    }

    // Draw Ball
    ctx.fillStyle = 'rgb(0, 0, 200)';
    ctx.fillRect(this.Ball.X, this.Ball.Y, this.Ball.Width, this.Ball.Height);

    // If the ball was hit last frame don't move it as it has already been moved when the ball was hit. 
    if (!this.BallHit) {
        // Animate Ball
        this.BallOldPos = [this.Ball.X, this.Ball.Y];
        this.Ball.X += this.BallVelocityX;
        this.Ball.Y += this.BallVelocityY;
    } else {
        this.BallHit = false;
    }

    // did ball hit field
    var testBox = new Box(0, 0, this.Field0Box.Width, this.Field0Box.Height);
    var IsHit = false;
    // loop backward so I hit the first row first. 
    for (by = this.Field.length-1; by > 0 && !IsHit; by--) {
        row = this.Field[by];
        testBox.Y = this.Field0Box.Y + by * this.Field0Box.Height;
        for (bx = 0; bx < row.length && !IsHit; bx++) {
            if (row[bx] == 1) {
                testBox.X = this.Field0Box.X + bx * this.Field0Box.Width;
                a = new Line(this.Ball.X, this.Ball.Y, this.BallOldPos[0],
                    this.BallOldPos[1]);
                HitLoc = LineVsBox(a, testBox);
                if (HitLoc.IsHit && HitLoc.Time > 0 && HitLoc.Time < gBallSpeed) {
                    // Delete the box we hit. 
                    row[bx] = 0;
                    IsHit = true; // don't hit more then once. The ball is going faster then the size of block. :) 
                    HitLoc = LineVsBox(a, testBox);
                    // Find where the ball colision happened. 
                    balldir = NormalizeLine(a);
                    justBeforeHit = HitLoc.Time - 1;
                    colBallPos = [a.X1 + balldir[0] * justBeforeHit,
                        a.Y1 + balldir[1] * justBeforeHit
                    ];
                    // Don't want to deal with ball not moving in strait lines so set BallOldPos to the colision point. 
                    this.BallOldPos = colBallPos;
                    // Calulate the reflected vector so we have the new direction. 
                    vnew = ReflectVector(balldir, HitLoc.Normal);
                    vnew = Normalize(vnew);
                    // From the colision point move the ball away keeping the same speed. 
                    this.Ball.X = colBallPos[0] + vnew[0] * (gBallSpeed - justBeforeHit);
                    this.Ball.Y = colBallPos[1] + vnew[1] * (gBallSpeed - justBeforeHit);
                    // Set the new velocity given the reflected vector. 
                    this.BallVelocityX = vnew[0] * gBallSpeed;
                    this.BallVelocityY = vnew[1] * gBallSpeed;
                }
            }
        }
    }

    // Check to see if the ball is going out of the world
    a = new Line(this.Ball.X, this.Ball.Y, this.BallOldPos[0],
        this.BallOldPos[1]);
    HitLoc = LineVsBox(a, this.WorldBox);
    // check it it hits the top or sides but not bottom 
    if (HitLoc.IsHit && HitLoc.Time > 0 && HitLoc.Time < gBallSpeed && HitLoc.Normal[1] != 1) {
        // Find where the ball colision happened. 
        balldir = NormalizeLine(a);
        justBeforeHit = HitLoc.Time - 1;
        colBallPos = [a.X1 + balldir[0] * justBeforeHit,
            a.Y1 + balldir[1] * justBeforeHit
        ];
        // Don't want to deal with ball not moving in strait lines so set BallOldPos to the colision point. 
        this.BallOldPos = colBallPos;
        // Calulate the reflected vector so we have the new direction. 
        vnew = ReflectVector(balldir, HitLoc.Normal);
        vnew = Normalize(vnew);
        // From the colision point move the ball away keeping the same speed. 
        this.Ball.X = colBallPos[0] + vnew[0] * (gBallSpeed - justBeforeHit);
        this.Ball.Y = colBallPos[1] + vnew[1] * (gBallSpeed - justBeforeHit);
        // Set the new velocity given the reflected vector. 
        this.BallVelocityX = vnew[0] * gBallSpeed;
        this.BallVelocityY = vnew[1] * gBallSpeed;

    }


    // did the ball hit the player
    a = new Line(this.Ball.X, this.Ball.Y, this.BallOldPos[0],
        this.BallOldPos[1]);
    HitLoc = LineVsBox(a, this.Player);
    if (HitLoc.IsHit && HitLoc.Time > 0 && HitLoc.Time < gBallSpeed) {
        // Find where the ball colision happened. 
        balldir = NormalizeLine(a);
        justBeforeHit = HitLoc.Time - 1;
        colBallPos = [a.X1 + balldir[0] * justBeforeHit,
            a.Y1 + balldir[1] * justBeforeHit
        ];
        // Calulate the reflected vector so we have the new direction. 
        vnew = ReflectVector(balldir, HitLoc.Normal);
        vnew = Normalize(vnew);
        // NormalizedDistFromLeftSize the left side of the box is -0.5 right size of the box is 0.5. 
        var NormalizedDistFromLeftSize = (colBallPos[0] + (this.Ball.Width/2.0) - (this.Player.X + (this.Player.Width/2.0))) / this.Player.Width;
        NormalizedDistFromLeftSize = Math.min(Math.max(NormalizedDistFromLeftSize, -0.5), 0.5);
        // Move the range to be 1/4 * PI
        //      this will make normallized vector using sin and cos like this \/
        // If it is close to the right the ball goes right if left left. 
        NormalizedDistFromLeftSize *= (1/2)*Math.PI;
        vnew[0]= Math.sin(NormalizedDistFromLeftSize);
        vnew[1]= -Math.cos(NormalizedDistFromLeftSize);

        // Don't want to deal with ball not moving in strait lines so set BallOldPos to the colision point. 
        this.BallOldPos = colBallPos;
        // From the colision point move the ball away keeping the same speed. 
        this.Ball.X = colBallPos[0] + vnew[0] * (gBallSpeed - justBeforeHit);
        this.Ball.Y = colBallPos[1] + vnew[1] * (gBallSpeed - justBeforeHit);
        // Set the new velocity given the reflected vector. 
        this.BallVelocityX = vnew[0] * gBallSpeed;
        this.BallVelocityY = vnew[1] * gBallSpeed;
        // Mark that we have already moved the ball so we don't move it next frame 
        this.BallHit = true;
    }

    this.PlayerVelocityX = 0;
    this.PlayerVelocityY = 0;

    //render the buffered canvas onto the original canvas element
    this.FrontCtx.drawImage(this.Canvas, 0, 0);
};





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


    document.addEventListener('keydown', function(event) {
        if (event.keyCode == 37) {
            if (gGame !== null) {
                gGame.LeftButton();
            }
        } else if (event.keyCode == 39) {
            if (gGame !== null) {
                gGame.RightButton();
            }
        } else if (event.keyCode == 32) {
            if (gGame !== null) {
                gGame.Reset();
            }
        }
    });

    function updateFrame() {
        gGame.Draw();
    }
}
