function percent(n){
    return Math.round(n*1000)/10;
}
function dec1(n){
    return Math.round(n*10)/10;
}
// Meter to Yard
function m2y(n){
    return n*1.093613;
}
// Yard to Feet
function y2f(n){
    return Math.round(n*30)/10;
}
function Vector(x,y){
    this.x=x;
    this.y=y;
    this.set = function(v){
        this.x=v.x;
        this.y=v.y;
    }
    this.setP = function(rad,r){
        this.x=Math.sin(rad)*r;
        this.y=Math.cos(rad)*r;
    }
    this.add = function (v){
        this.x+=v.x;
        this.y+=v.y;
    }
    this.sub = function (v){
        this.x-=v.x;
        this.y-=v.y;
    }
    this.pow = function(){
        return (this.x*this.x+this.y*this.y);
    }
    this.abs = function(){
        return Math.sqrt(this.pow());
    }
    this.grad = function(){
        if( this.x == 0){
            return 0;
        }else{
            return (this.y/this.x);
        }
    }
    this.scale = function (n){ // Coefficient
        return new Vector(this.x*n,this.y*n);
    }
    this.e = function (n){ // Unit vector
        var r=this.abs();
        if(r == 0){
            return new Vector(0,0);
        }else{
            return new Vector(this.x*n/r,this.y*n/r);
        }
    }
}
function Particle(dt){
    this.v = new Vector(0,0);
    this.x=0;
    this.y=0;
    this.r=0;
    this.len=0;
    this.reset = function(ang,ini_spd){
        this.v.setP(ang,ini_spd);
        this.x=0;
        this.y=0;
        this.r=0;
        this.len=0;
    }
    // Acceleration
    this.acc = function(ax,ay){
        this.v.add({x : ax*dt, y : ay*dt});
        var diff=this.v.scale(dt);
        this.add(diff);
        this.r=diff.abs();
        this.len+=this.r;
    }
    // Duplicate Object
    this.dup= function(){
        p= new Particle(dt);
        p.x=this.x;p.y=this.y;p.v.x=this.v.x;p.v.y=this.v.y;
        return p;
    }
    // Y value at intersection of X axis and velocity vector
    this.x_axis = function(){
        return (this.y-this.v.grad()*this.x);
    }
    // Kinectic Energy
    this.ke=function(){
        return this.v.pow()/2;
    }
}
Particle.prototype= new Vector(0,0);
function Curve(mu,inc,p){
    var grad=mu*inc;
    this.len=0;
    this.push(p.dup());
    this.within = function(r){
        while(p.len < r){
            this.push_acc();
        }
    }
    this.x_axis = function(r){
        while(p.x_axis() < r){
            this.push_acc();
        }
    }
    this.push_acc = function(){
        var d=p.v.e(mu);
        p.acc(d.x,d.y-grad);
        this.push(p.dup());
    }
}
Curve.prototype= new Array(0);
function Drawing(scale){
    var ctx = document.getElementById('canvas').getContext('2d');
    ctx.clearRect(0,0,600,600);
    ctx.save();
    ctx.translate(300,300);
    ctx.font = "20px Times New Roman";
    ctx.fillStyle = "Black";
    this.close= function(){
        ctx.restore();
    }
    this.beginPath = function(){
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0,0);
    }
    this.mark = function(p,r){
        var x=p.x*scale;
        var y=p.y*scale;
        ctx.moveTo(x,y);
        ctx.arc(x,y,r*scale,0,Math.PI*2);
    }
    this.closePath = function(){
        ctx.fillStyle='#fa5';
        ctx.fill();
        ctx.restore();
    }
    this.solidLine = function(v1,v2,color){
        ctx.save();
        ctx.beginPath();
        var x1=v1.x*scale;
        var y1=v1.y*scale;
        var x2=v2.x*scale;
        var y2=v2.y*scale;
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.strokeStyle =color;
        ctx.stroke();
        ctx.restore();
    }
    this.solidCircle = function(v,r,color){
        ctx.save();
        ctx.beginPath();
        var x=v.x*scale;
        var y=v.y*scale;
        ctx.moveTo(x,y);
        ctx.arc(x,y,r*scale,0,Math.PI*2);
        ctx.fillStyle=color;
        ctx.fill();
        ctx.restore();
    }
    this.lineCircle = function(v,r,color){
        ctx.save();
        ctx.beginPath();
        var x=v.x*scale;
        var y=v.y*scale;
        ctx.moveTo(x+r*scale,y);
        ctx.arc(x,y,r*scale,0,Math.PI*2);
        ctx.strokeStyle=color;
        ctx.stroke();
        ctx.restore();
    }
    this.unitCircle = function(unit){
        this.lineCircle({x:0,y:0},unit,'#000');
    }
    this.text = function(str,p){
        ctx.fillText(str,p.x*scale,p.y*scale);
    }
}
function init(){
    var h=Number(document.getElementById('h').value);
    var lu=Number(document.getElementById('up').value);
    var ld=Number(document.getElementById('dw').value);
    var mu=h*(ld+lu)/2/ld/lu;
    var grad=h*(ld-lu)/2/ld/lu;
    document.getElementById('mu').textContent=percent(mu);
    document.getElementById('grad').textContent=percent(grad);
    document.getElementById('inc').value=grad/mu;
    draw();
}
function draw(){
    var g=m2y(9.8);
    var dt=0.01;
    var mu=document.getElementById('mu').textContent/100;
    var res=mu*g;
    var inc=document.getElementById('inc').value;
    document.getElementById('drift').textContent=percent(inc);
    document.getElementById('grad').textContent=percent(inc*mu);
    var r=document.getElementById('dis').value;
    document.getElementById('dist').textContent=r;
    var std_head=mu*r;
    document.getElementById('head').textContent=y2f(std_head);
    var mag=document.getElementById('mag').value;
    document.getElementById('zoom').textContent=mag;
    var over=document.getElementById('over').value;
    document.getElementById('oh').textContent=over;
    var oh=over*r/100;
    var ini_spd=Math.sqrt(oh*res*2);
    var spot=r*inc;
    //var target=(spot-ini_spd*dt*oh)/2;
    var target=spot/2;
    var dev=Math.round(1/(1-inc))*2-1;
    var scale=240*mag/r;
    //For Fall Line
    var p = new Particle(dt,0,0,0,0);
    p.reset(0,ini_spd);
    var cur0 = new Curve(res,inc,p);
    cur0.within(r);
    var dw=new Drawing(scale);
    var div=12;
    var pary=new Array(0);
    for(var j=-div;j < div; j++){
        var rad=Math.pow((j+0.5)/div,dev)*Math.PI;
        dw.beginPath();
        p.reset(rad,ini_spd);
        var cur = new Curve(res,inc,p);
        if(true){
            cur.within(r);
        }else{
            cur.x_axis(target);
        }
        for(var i=0;i<cur.length;i++){
            dw.mark(cur[i],cur[i].v.pow()/100);
        }
        dw.closePath();
        var head=p.ke()/g
        dw.text(y2f(head)+'ft('+dec1(head/std_head)+')',p);
        var p1=p.dup();
        p.sub(p.v.scale(p.v.abs()/res/2));
        var p2=p.dup();
        p.sub({x:p.x,y:p.v.grad()*p.x});
        var p3=p.dup();
        pary.push({p1:p1,p2:p2,p3:p3});
    }
    for(var i=0;i < div*2;i++){
        var pa=pary[i];
        dw.solidLine(pa.p1,pa.p2,'#a0a');
        if(pa.p1.x * pa.p2.x >0){
            dw.solidLine(pa.p2,pa.p3,'#0aa');
        }
        dw.solidCircle(pa.p2,0.02,'#333');
    }
    dw.unitCircle(1);
    dw.unitCircle(r);
    dw.solidCircle({x:0,y:0},0.05,'#000');
    dw.solidCircle({x:0,y:spot},0.05,'#000');
    dw.solidCircle({x:0,y:target},0.05,'#aaa');
    dw.text(y2f(target)+'ft('+percent(target/r)+'%)',{x:0,y:target});
    dw.lineCircle({x:0,y:target-spot},r,'#0f0');
    dw.solidCircle({x:0,y:target-spot},0.05,'#0f0');
    dw.close();
}
