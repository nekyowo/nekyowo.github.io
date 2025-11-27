(function(){
    var canvas = document.getElementById('bgCanvas');
    if(!canvas) return;
    var ctx = canvas.getContext('2d');
    var dpi = window.devicePixelRatio || 1;

    function resize(){
        canvas.width = Math.floor(window.innerWidth * dpi);
        canvas.height = Math.floor(window.innerHeight * dpi);
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.setTransform(dpi,0,0,dpi,0,0);
    }

    window.addEventListener('resize', resize);
    resize();

    var mouse = { x: null, y: null };
    window.addEventListener('mousemove', function(e){ mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseout', function(){ mouse.x = null; mouse.y = null; });

    var particles = [];
    var config = {
        count: Math.max(25, Math.floor((window.innerWidth * window.innerHeight)/100000)),
        maxVel: 0.28,
        size: 1.1,
        linkDist: 120
    };

    function rand(min,max){ return Math.random()*(max-min)+min }

    function init(){
        particles = [];
        for(var i=0;i<config.count;i++){
            particles.push({
                x: rand(0, window.innerWidth),
                y: rand(0, window.innerHeight),
                vx: rand(-config.maxVel, config.maxVel),
                vy: rand(-config.maxVel, config.maxVel),
                r: rand(0.6, config.size)
            });
        }
    }

    function step(){
        ctx.clearRect(0,0,canvas.width, canvas.height);

        // draw links
        for(var i=0;i<particles.length;i++){
            var p = particles[i];
            for(var j=i+1;j<particles.length;j++){
                var q = particles[j];
                var dx = p.x-q.x, dy = p.y-q.y;
                var dist = Math.sqrt(dx*dx+dy*dy);
                if(dist < config.linkDist){
                    var alpha = 1 - (dist / config.linkDist);
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(140,200,220,'+(0.04*alpha)+')';
                    ctx.lineWidth = 0.9 * alpha;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.stroke();
                }
            }
        }

        // update and draw particles
        for(var i=0;i<particles.length;i++){
            var p = particles[i];
            // mouse interaction (gentle attraction)
            if(mouse.x !== null){
                var dx = mouse.x - p.x, dy = mouse.y - p.y;
                var dist = Math.sqrt(dx*dx+dy*dy);
                if(dist < 120){
                    p.vx -= (dx/dist) * 0.02;
                    p.vy -= (dy/dist) * 0.02;
                }
            }

            p.x += p.vx;
            p.y += p.vy;

            // wrap edges
            if(p.x < -10) p.x = window.innerWidth + 10;
            if(p.x > window.innerWidth + 10) p.x = -10;
            if(p.y < -10) p.y = window.innerHeight + 10;
            if(p.y > window.innerHeight + 10) p.y = -10;

            // draw
            ctx.beginPath();
            ctx.fillStyle = 'rgba(160,210,235,0.55)';
            ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
            ctx.fill();
        }

        requestAnimationFrame(step);
    }

    init();
    step();

    // re-init on resize to adapt density
    var resizeTimer;
    window.addEventListener('resize', function(){
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function(){
            config.count = Math.max(40, Math.floor((window.innerWidth * window.innerHeight)/60000));
            init();
            resize();
        }, 200);
    });

})();
