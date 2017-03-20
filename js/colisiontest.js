function Box(x, y, width, height) {
    this.X = x;
    this.Y = y;
    this.Width = width;
    this.Height = height;
}

function Ball(x, y, r) {
    this.X = x;
    this.Y = y;
    this.R = r;
}

function LineFromArray(linearray) {
    this.X1 = linearray[0];
    this.Y1 = linearray[1];
    this.X2 = linearray[2];
    this.Y2 = linearray[3];
}

function Ray(x1, y1, x2, y2) {
    this.Orig = [x1, y1];
    var a = [x2 - x1, y2 - y1];
    var len = Math.sqrt(a[0] * a[0] + a[1] * a[1]);
    var oolen = 1.0 / len;
    this.Dir = [a[0] * oolen, a[1] * oolen];
    this.Length = len;
}

function VectorSub(a, b) {
    return [a[0] - b[0], a[1] - b[1]];
}

// return a normal from a line
function VectorLength(a) {
    // a normal 
    var len = Math.sqrt(a[0] * a[0] + a[1] * a[1]);
    return len;
}

function LineLength(line) {
    var a = [line.X2 - line.X1, line.Y2 - line.Y1];
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


// orgin 2d vector x and y of start of ray. 
// rdir 2d vector x and y of the normalized direction of ray. 
// b is a box 
// {IsHit=false, Normal=side, Time=t}
function RayVsBoxInside(orig, rdir, b) {
    dfx = 1.0 / rdir[0];
    dfy = 1.0 / rdir[1];

    // time to hit left, right, bottom, top
    var t1 = (b.X - orig[0]) * dfx;
    var t2 = (b.X + b.Width - orig[0]) * dfx;
    var t3 = (b.Y + b.Height - orig[1]) * dfy;
    var t4 = (b.Y - orig[1]) * dfy;
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
        return [];
    }

    var colPos = [orig[0] + rdir[0] * tmin, orig[1] + rdir[1] * tmin];
    var hit = { Position: colPos, Normal: tdir, Time: tmin };
    return [hit];
}

// orgin 2d vector x and y of start of ray. 
// rdir 2d vector x and y of the normalized direction of ray. 
// b is a box 
// {IsHit=false, Normal=side, Time=t}
function RayVsBoxOutsize(orig, rdir, b) {

    var dfx = 1.0 / rdir[0];
    var dfy = 1.0 / rdir[1];

    // time to hit left, right, bottom, top
    var t1 = (b.X - orig[0]) * dfx;
    var t2 = (b.X + b.Width - orig[0]) * dfx;
    var t3 = (b.Y + b.Height - orig[1]) * dfy;
    var t4 = (b.Y - orig[1]) * dfy;

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
        return [];
    }

    // if tmin > tmax, ray doesn't intersect AABB
    if (tmin > tmax) {
        t = tmax;
        return [];
    }

    t = tmin;

    var colPos = [orig[0] + rdir[0] * t, orig[1] + rdir[1] * t];
    var hit = { Position: colPos, Normal: side, Time: t };
    return [hit];
}

// orgin 2d vector x and y of start of ray. 
// rdir 2d vector x and y of the normalized direction of ray. 
// b is a box 
// {IsHit=false, Normal=side, Time=t}
function RayVsBox(orig, rdir, b) {
    if (b.X <= orig[0] && orig[0] <= b.X + b.Width &&
        b.Y <= orig[1] && orig[1] <= b.Y + b.Height) {
        return RayVsBoxInside(orig, rdir, b);
    }
    return RayVsBoxOutsize(orig, rdir, b);
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

// Line a vs box b
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


var gGame = null;

function GameOnMouseDown(_this, canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    _this.MouseDown = true;
    _this.MouseX = evt.clientX - rect.left;
    _this.MouseY = evt.clientY - rect.top;
    _this.MouseSelected = null;
    _this.MouseSelectedObjIndex = 0;
    _this.MouseSelectedVertIndex = 0;

    for (var i = 0; i < _this.Objects.length; i++) {
        var obj = _this.Objects[i];
        var pix = 5;

        for (var j = 0; j < obj.verts.length; j++) {
            if (Math.abs(_this.MouseX - obj.verts[j][0]) < pix &&
                Math.abs(_this.MouseY - obj.verts[j][1]) < pix) {
                _this.MouseSelected = obj;
                _this.MouseSelectedObjIndex = i;
                _this.MouseSelectedVertIndex = j;
            }
        }
    }
}

function GameOnMouseUp(_this, canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    _this.MouseSelected = null;
    _this.MouseSelectedObjIndex = 0;
    _this.MouseSelectedVertIndex = 0;
    _this.MouseX = evt.clientX - rect.left;
    _this.MouseY = evt.clientY - rect.top;
}

function GameOnMouseMove(_this, canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    _this.MouseX = evt.clientX - rect.left;
    _this.MouseY = evt.clientY - rect.top;
}

function Game(canvas, backcanvas, frontctx, backctx) {
    this.Canvas = backcanvas;
    this.FrontCanvas = canvas;
    this.Ctx = backctx;
    this.FrontCtx = frontctx;
    this.ScreenWidth = canvas.width;
    this.ScreenHeight = canvas.height;

    this.MouseX = 0;
    this.MouseY = 0;
    this.MouseSelected = null;
    this.MouseSelectedObjIndex = 0;
    this.MouseSelectedVertIndex = 0;    
    this.Objects = [];

    var _this = this;
    this.FrontCanvas.onmousedown = function(evt) {
        GameOnMouseDown(_this, _this.FrontCanvas, evt);
    };
    this.FrontCanvas.onmouseup = function(evt) {
        GameOnMouseUp(_this, _this.FrontCanvas, evt);
    };
    this.FrontCanvas.onmousemove = function(evt) {
        GameOnMouseMove(_this, _this.FrontCanvas, evt);
    };
}

function AddRay() {
    var x1 = parseInt(document.getElementById('LineX1').value);
    var y1 = parseInt(document.getElementById('LineY1').value);
    var x2 = parseInt(document.getElementById('LineX2').value);
    var y2 = parseInt(document.getElementById('LineY2').value);
    gGame.Objects.push({
        objtype: "Ray",
        verts: [
            [x1, y1],
            [x2, y2]
        ]
    });
}

function AddBox() {

    var x = parseInt(document.getElementById('BoxX').value);
    var y = parseInt(document.getElementById('BoxY').value);
    var w = parseInt(document.getElementById('BoxWidth').value);
    var h = parseInt(document.getElementById('BoxHieght').value);

    gGame.Objects.push({
        objtype: "Box",
        verts: [
            [x, y],
        ],
        width: w,
        height: h
    });
}

function AddBall() {

    var x = parseInt(document.getElementById('BallX').value);
    var y = parseInt(document.getElementById('BallY').value);
    var r = parseInt(document.getElementById('BallR').value);

    gGame.Objects.push({
        objtype: "Ball",
        verts: [
            [x, y],
        ],
        radius: r,
    });
}

function LineReflection(ray, HitLoc) {
    // Find where the ball colision happened.                                                                             
    dir = ray.Dir;
    speed = ray.Length;
    var colPos = HitLoc.Position;
    // Calulate the reflected vector so we have the new direction.                       
    vnew = ReflectVector(dir, HitLoc.Normal);

    // From the colision point move the ball away keeping the same speed.                                                                             
    var newPos = [colPos[0] + vnew[0] * (speed - HitLoc.Time),
        colPos[1] + vnew[1] * (speed - HitLoc.Time)
    ];

    return { ColPos: colPos, NewPos: newPos };
}

Game.prototype.DrawRay = function(rayobj)
{    
    var ctx = this.Ctx;    
    var i=0;
    var ray = new Ray(rayobj.verts[0][0], rayobj.verts[0][1], rayobj.verts[1][0], rayobj.verts[1][1]);

    ctx.strokeStyle = 'rgb(255, 0, 0)';
    ctx.beginPath();
    ctx.moveTo(rayobj.verts[0][0], rayobj.verts[0][1]);
    ctx.lineTo(rayobj.verts[1][0], rayobj.verts[1][1]);
    ctx.stroke();

    for (var j = 0; j < this.Objects.length; j++) {
        var obj = this.Objects[j];
        if(obj.objtype == "Ball"){
            hits = RayVsBall(ray.Orig, ray.Dir, [obj.verts[0][0], obj.verts[0][1]], obj.radius);
            for (i = 0; i < hits.length; i++) {
                HitLoc = hits[i];
                if (HitLoc.Time < speed) {
                    ColData = LineReflection(ray, HitLoc);
                    ctx.strokeStyle = 'rgb(200, 200, 0)';
                    ctx.beginPath();
                    ctx.moveTo(ColData.ColPos[0], ColData.ColPos[1]);
                    ctx.lineTo(ColData.NewPos[0], ColData.NewPos[1]);
                    ctx.stroke();
                }
            }
        }
        else if(obj.objtype == "Box")
        {
            var box = new Box(obj.verts[0][0], obj.verts[0][1], obj.width, obj.height);
            var hits;
            var HitLoc;
            hits = RayVsBox(ray.Orig, ray.Dir, box);

            var speed = ray.Length;
            for (i = 0; i < hits.length; i++) {
                HitLoc = hits[i];
                if (HitLoc.Time < speed) {
                    ColData = LineReflection(ray, HitLoc);
                    ctx.strokeStyle = 'rgb(200, 200, 0)';
                    ctx.beginPath();
                    ctx.moveTo(ColData.ColPos[0], ColData.ColPos[1]);
                    ctx.lineTo(ColData.NewPos[0], ColData.NewPos[1]);
                    ctx.stroke();
                }
            }

        }
    }    
};

Game.prototype.Draw = function() {
    var ctx = this.Ctx;

    // clear last frame
    ctx.fillStyle = 'rgb(100, 100, 100)';
    ctx.fillRect(0, 0, this.Canvas.width, this.Canvas.height);

    if(this.MouseSelected)
    {
        var vert = this.MouseSelected.verts[this.MouseSelectedVertIndex];
        vert[0] = this.MouseX;
        vert[1] = this.MouseY;
    }

    for (var i = 0; i < this.Objects.length; i++) {
        var obj = this.Objects[i];
        if(obj.objtype == "Ray"){
            this.DrawRay(obj);
        }
        else if(obj.objtype == "Box"){
            ctx.fillStyle = 'rgb(0, 0, 0)';
            ctx.fillRect(obj.verts[0][0], obj.verts[0][1], obj.width, obj.height);
        }
        else if(obj.objtype == "Ball"){
            ctx.strokeStyle = 'rgb(0, 0, 255)';
            ctx.beginPath();
            ctx.arc(obj.verts[0][0], obj.verts[0][1], obj.radius, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }

    //render the buffered canvas onto the original canvas element
    this.FrontCtx.drawImage(this.Canvas, 0, 0);
};


function updateFrame() {
    gGame.Draw();
}


function newGame() {
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
