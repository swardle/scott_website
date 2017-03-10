// a very simple clone of atari breakout. 
var gPlayerSpeed = 11;
var gBallSpeed = 8;
// x,y,width,hieght
var gInitBallBox = [8, 128, 3, 3];
var gInitPlayerBox = [0, 256 - 4, 64, 4];
var gInitField0Box = [0, 0, 16, 8];


// ResourceCache a cache for loading art for the game.
function ResourceCache() {
    this.resourceCache = {};
    this.loading = [];
    this.readyCallbacks = [];
}

// Load an image url or an array of image urls
ResourceCache.prototype.load = function(urlOrArr) {
    if (urlOrArr instanceof Array) {
        urlOrArr.forEach(function(url) {
            this._load(url);
        });
    } else {
        this._load(urlOrArr);
    }
};

ResourceCache.prototype._load = function(url) {
    if (this.resourceCache[url]) {
        return this.resourceCache[url];
    } else {
        var img = new Image();
        var _this = this;
        img.onload = function() {
            _this.resourceCache[url] = img;

            if (_this.isReady()) {
                _this.readyCallbacks.forEach(function(func) { func(); });
            }
        };
        this.resourceCache[url] = false;
        img.src = url;
    }
};

ResourceCache.prototype.get = function(url) {
    return this.resourceCache[url];
};

ResourceCache.prototype.isReady = function() {
    var ready = true;
    for (var k in this.resourceCache) {
        if (this.resourceCache.hasOwnProperty(k) &&
            !this.resourceCache[k]) {
            ready = false;
        }
    }
    return ready;
};

ResourceCache.prototype.onReady = function(func) {
    this.readyCallbacks.push(func);
};

// ResourceCache a cache for loading art for the game.
var gBox = "img/box.png";
var gBall = "img/ball.png";
var gCache = new ResourceCache();
gCache.load(gBox);
gCache.load(gBall);



function Ball() {
    this.X = gInitBallBox[0];
    this.Y = gInitBallBox[1];
    this.Width = gInitBallBox[2];
    this.Height = gInitBallBox[2];
    this.Speed = gBallSpeed;
    this.Velocity = [0, gBallSpeed];
    this.Direction = Normalize(this.Velocity);
    this.OldPos = [gInitBallBox[0] - this.Velocity[1], gInitBallBox[1] - this.Velocity[1]];
    this.IsHit = false;
}

Ball.prototype.BallCollision = function(testBox, objectType, collisionFunction) {
    a = new Line(this.X, this.Y, this.OldPos[0], this.OldPos[1]);
    var HitLoc = collisionFunction(a, testBox);
    return HitLoc;
};

Ball.prototype.BallReflection = function(testBox, objectType, collisionFunction, HitLoc) {
    HitLoc = collisionFunction(a, testBox);
    // Find where the ball colision happened.                                                                             
    balldir = NormalizeLine(a);
    justBeforeHit = HitLoc.Time - 1;
    colBallPos = [a.X2 + balldir[0] * justBeforeHit, a.Y2 + balldir[1] * justBeforeHit];
    // Calulate the reflected vector so we have the new direction.                       
    vnew = ReflectVector(balldir, HitLoc.Normal);

    // With Players hack the colision normal so it will bouce different depending on where it hits the players box. 
    // If it hits the left size it goes left right side goes right
    if (objectType == "Player") {
        // NormalizedDistFromLeftSize the left side of the box is -0.5 right size of the box is 0.5.                                                      
        var NormalizedDistFromLeftSize = (colBallPos[0] + (this.Width / 2.0) - (testBox.X + (testBox.Width / 2.0))) / testBox.Width;
        NormalizedDistFromLeftSize = Math.min(Math.max(NormalizedDistFromLeftSize, -0.5), 0.5);
        // Move the range to be 1/4 * PI                                                                                                                  
        //      this will make normallized vector using sin and cos like this \/                                                                          
        // If it is close to the right the ball goes right if left left.                                                                                  
        NormalizedDistFromLeftSize *= (1 / 2) * Math.PI;
        vnew[0] = Math.sin(NormalizedDistFromLeftSize);
        vnew[1] = -Math.cos(NormalizedDistFromLeftSize);
    }

    this.OldPos = colBallPos;
    // From the colision point move the ball away keeping the same speed.                                                                             
    this.X = colBallPos[0] + vnew[0] * (gBallSpeed - justBeforeHit);
    this.Y = colBallPos[1] + vnew[1] * (gBallSpeed - justBeforeHit);
    // Set the new velocity given the reflected vector.                                                                                               
    this.Velocity[0] = vnew[0] * gBallSpeed;
    this.Velocity[1] = vnew[1] * gBallSpeed;
    // Mark that we have already moved the ball so we don't move it next frame                                                                        
    this.IsHit = true;

};

// Draw the ball centered
Ball.prototype.Draw = function(ctx) {
    // Draw Ball
    //ctx.fillStyle = 'rgb(0, 0, 200)';
    //ctx.fillRect(this.X - this.Width / 2.0, this.Y - this.Height / 2.0, this.Width, this.Height);
    img = gCache.get(gBall);
    ctx.drawImage(img,0,0,img.width,
        img.height,this.X - this.Width / 2.0, this.Y - this.Height / 2.0, this.Width, this.Height);
};

Ball.prototype.Move = function() {
    // If the ball was hit last frame don't move it as it has already been moved when the ball was hit. 
    if (!this.IsHit) {
        // Animate Ball
        this.OldPos = [this.X, this.Y];
        this.X += this.Velocity[0];
        this.Y += this.Velocity[1];
    } else {
        this.IsHit = false;
    }
};

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
function VectorLength(a) {
    // a normal 
    var len = Math.sqrt(a[0] * a[0] + a[1] * a[1]);
    return len;
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

// d is a vector
// n is the normal of the vector to reflect over
//
// Vnew = ( -2*(V dot N)*N + V )
function ReflectVector(d, n) {
    var dn = -2 * Dot(d, n);
    var vnew = [dn * n[0] + d[0], dn * n[1] + d[1]];
    return vnew;
}

function LineVsBoxInside(a, b) {
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
    var xdir = [1, 0];
    var ydir = [0, 1];
    var tdir = [0, 1];

    // x did we hit the left wall first?
    var xmin = t1;
    var xmax = t2;
    xdir[0] = 1;
    if (t1 < t2) {
        // nope we hit the right wall first.
        xmin = t2;
        xmax = t1;
        xdir[0] = -1;
    }

    // If we hit the left or right wall in the past then 
    // really we should hit the other wall. 
    if (xmin < 0) {
        xmin = xmax;
        xdir[0] *= -1;
    }

    // y
    var ymin = t3;
    var ymax = t4;
    ydir[1] = -1;
    if (t3 < t4) {
        ymin = t4;
        ymax = t3;
        ydir[1] = 1;
    }

    if (ymin < 0) {
        ymin = ymax;
        ydir[1] *= -1;
    }

    // pick which one is closer x or y. 
    var tmin = ymin;
    tdir = ydir;
    if (ymin > xmin) {
        tmin = xmin;
        tdir = xdir;
    }

    if (tmin < 0) {
        return { IsHit: false, Normal: tdir, Time: tmin };
    }

    return { IsHit: true, Normal: tdir, Time: tmin };

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
    this.WorldBox = new BoxFromArray([0, 0, this.WorldWidth, this.WorldHight]);
    this.Player = new BoxFromArray(gInitPlayerBox);
    this.Field0Box = new BoxFromArray(gInitField0Box);
    this.ResetField();


    img = gCache.get(gBox);

    this.BoxCanvas = document.createElement("canvas");
    this.BoxCtx = this.BoxCanvas.getContext('2d');

    this.BoxCanvas.width = gInitField0Box[2];
    this.BoxCanvas.height = gInitField0Box[3];

    this.BoxCtx.drawImage(img, 0, 0, img.width,img.height, 
            0,0,gInitField0Box[2], gInitField0Box[3]);
    this.BoxCtx.globalCompositeOperation = "multiply"; // 'source-atop';
    this.BoxCtx.fillStyle = 'red';
    this.BoxCtx.fillRect(0, 0, gInitField0Box[2], gInitField0Box[3]);
}

Game.prototype.RightButtonDown = function() {
    this.PlayerVelocityX = gPlayerSpeed;
};

Game.prototype.LeftButtonDown = function() {
    this.PlayerVelocityX = -gPlayerSpeed;
};

Game.prototype.LeftButtonUp = function() {
    this.PlayerVelocityX = 0;
};

Game.prototype.RightButtonUp = function() {
    this.PlayerVelocityX = 0;
};

Game.prototype.ResetField = function() {
    this.Ball = new Ball();

    var widthInBoxes = 32;
    var a = [
        "*".repeat(widthInBoxes),
        "*".repeat(widthInBoxes),
        "*".repeat(widthInBoxes),
        "",
        "",
        "",
        "*".repeat(widthInBoxes),
        "*".repeat(widthInBoxes),
    ];

    this.Field = [];
    for (var i = 0; i < a.length; i++) {
        var temp = [];
        for (var j = 0; j < a[i].length; j++) {
            if (a[i][j] === "*") {
                temp.push(1);
            }
        }
        this.Field.push(temp);
    }
};
Game.prototype.Draw = function() {
    var ctx = this.Ctx;

    // clear last frame
    ctx.fillStyle = 'rgb(200, 200, 200)';
    ctx.fillRect(0, 0, this.Canvas.width, this.Canvas.height);

    // Draw Player 
    ctx.fillStyle = 'rgb(0, 200, 0)';
    // ctx.fillRect(this.Player.X, this.Player.Y, this.Player.Width, this.Player.Height);
    img = gCache.get(gBox);
    ctx.drawImage(img,0,0,img.width, img.height,
        this.Player.X, this.Player.Y, this.Player.Width, this.Player.Height);


    this.Ball.Draw(ctx);

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
                ctx.drawImage(this.BoxCanvas,0,0,this.BoxCanvas.width, this.BoxCanvas.height,
                    x, y, this.Field0Box.Width, this.Field0Box.Height);

            }
        }
    }

    this.Ball.Move();

    // did ball hit field
    var testBox = new Box(0, 0, this.Field0Box.Width, this.Field0Box.Height);
    // loop backward so I hit the first row first. 
    for (by = this.Field.length - 1; by >= 0; by--) {
        row = this.Field[by];
        testBox.Y = this.Field0Box.Y + by * this.Field0Box.Height;
        for (bx = 0; bx < row.length; bx++) {
            if (row[bx] == 1) {
                testBox.X = this.Field0Box.X + bx * this.Field0Box.Width;

                HitLoc = this.Ball.BallCollision(testBox, "Field", LineVsBox);
                if (HitLoc.IsHit && HitLoc.Time > 0 && HitLoc.Time < this.Ball.Speed) {
                    // Delete the box we hit. 
                    row[bx] = 0;
                    this.Ball.BallReflection(testBox, "Field", LineVsBox, HitLoc);
                }
            }
        }
    }

    // Check to see if the ball is going out of the world
    HitLoc = this.Ball.BallCollision(this.WorldBox, "World", LineVsBoxInside);
    if (HitLoc.IsHit && HitLoc.Time > 0 && HitLoc.Time < this.Ball.Speed && HitLoc.Normal[1] !== -1) {
        this.Ball.BallReflection(this.WorldBox, "World", LineVsBoxInside, HitLoc);
    }

    // Check to see if the ball is going out of the world
    HitLoc = this.Ball.BallCollision(this.Player, "Player", LineVsBox);
    if (HitLoc.IsHit && HitLoc.Time > 0 && HitLoc.Time < this.Ball.Speed) {
        this.Ball.BallReflection(this.Player, "Player", LineVsBox, HitLoc);
    }

    this.Player.X += this.PlayerVelocityX;
    if (this.Player.X + this.Player.Width > this.WorldWidth) {
        this.Player.X = this.WorldWidth - this.Player.Width;
    }
    if (this.Player.X < 0) {
        this.Player.X = 0;
    }

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

    document.addEventListener('keyup', function(event) {
        if (event.keyCode == 37) {
            if (gGame !== null) {
                gGame.LeftButtonUp();
            }
        } else if (event.keyCode == 39) {
            if (gGame !== null) {
                gGame.RightButtonUp();
            }
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.keyCode == 37) {
            if (gGame !== null) {
                gGame.LeftButtonDown();
            }
        } else if (event.keyCode == 39) {
            if (gGame !== null) {
                gGame.RightButtonDown();
            }
        } else if (event.keyCode == 32) {
            if (gGame !== null) {
                gGame.ResetField();
            }
        }
    });

    function updateFrame() {
        gGame.Draw();
    }
}

gCache.onReady(newGame);

