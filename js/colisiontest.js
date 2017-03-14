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

function LineLength(line) {
    var a = [line.X2 - line.X1,line.Y2 - line.Y1];
    var len = Math.sqrt(a[0] * a[0] + a[1] * a[1]);
    return len;
}

// return a normal from a line
function NormalizeLine(a) {
    // a normal 
    var l = [a.X2 - a.X1, a.Y2 - a.Y1];
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
    var t1 = (b.X - a.X1) * dfx;
    var t2 = (b.X + b.Width - a.X1) * dfx;
    var t3 = (b.Y + b.Height - a.Y1) * dfy;
    var t4 = (b.Y - a.Y1) * dfy;
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
    console.log("Hi there\nHi");

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
    var t1 = (b.X - a.X1) * dfx;
    var t2 = (b.X + b.Width - a.X1) * dfx;
    var t3 = (b.Y + b.Height - a.Y1) * dfy;
    var t4 = (b.Y - a.Y1) * dfy;

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


var gGame = null;

function Game(canvas, backcanvas, frontctx, backctx) {
    this.Canvas = backcanvas;
    this.FrontCanvas = canvas;
    this.Ctx = backctx;
    this.FrontCtx = frontctx;
    this.ScreenWidth = canvas.width;
    this.ScreenHeight = canvas.height;
}


function LineReflection(line, box, HitLoc) {
    // Find where the ball colision happened.                                                                             
    dir = NormalizeLine(line);
    speed = LineLength(line);
    justBeforeHit = HitLoc.Time - 1;
    colPos = [line.X1 + dir[0] * justBeforeHit, line.Y1 + dir[1] * justBeforeHit];
    // Calulate the reflected vector so we have the new direction.                       
    vnew = ReflectVector(dir, HitLoc.Normal);

    // From the colision point move the ball away keeping the same speed.                                                                             
    var newPos = [colPos[0] + vnew[0] * (speed - justBeforeHit), 
                  colPos[1] + vnew[1] * (speed - justBeforeHit)];

    return {ColPos:colPos, NewPos:newPos};
}



Game.prototype.Draw = function() {
    var ctx = this.Ctx;

    // clear last frame
    ctx.fillStyle = 'rgb(100, 100, 100)';
    ctx.fillRect(0, 0, this.Canvas.width, this.Canvas.height);

    var LineX1 = parseInt(document.getElementById('LineX1').value);
    var LineY1 = parseInt(document.getElementById('LineY1').value);
    var LineX2 = parseInt(document.getElementById('LineX2').value);
    var LineY2 = parseInt(document.getElementById('LineY2').value);

    var BoxX = parseInt(document.getElementById('BoxX').value);
    var BoxY = parseInt(document.getElementById('BoxX').value);
    var BoxWidth = parseInt(document.getElementById('BoxWidth').value);
    var BoxHieght = parseInt(document.getElementById('BoxHieght').value);

    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(BoxX, BoxY, BoxWidth, BoxHieght);

    ctx.strokeStyle = 'rgb(255, 0, 0)';
    ctx.beginPath();
    ctx.moveTo(LineX1, LineY1);
    ctx.lineTo(LineX2, LineY2);
    ctx.stroke();

    var line = new Line(LineX1, LineY1, LineX2, LineY2);
    var box = new Box(BoxX, BoxY, BoxWidth, BoxHieght);
    HitLoc = LineVsBox(line, box);
    speed = LineLength(line);    
    if(HitLoc.IsHit && HitLoc.Time < speed)
    {
        ColData = LineReflection(line,box,HitLoc);
        ctx.strokeStyle = 'rgb(200, 200, 0)';
        ctx.beginPath();
        ctx.moveTo(ColData.ColPos[0], ColData.ColPos[1]);
        ctx.lineTo(ColData.NewPos[0], ColData.NewPos[1]);
        ctx.stroke();
    }






    //render the buffered canvas onto the original canvas element
    this.FrontCtx.drawImage(this.Canvas, 0, 0);
};


function updateFrame() {
    gGame.Draw();
}


function newGame() {
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
}

newGame();
