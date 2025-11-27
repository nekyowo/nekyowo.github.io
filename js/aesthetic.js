// Simple aesthetic interactions: fade audio, parallax video, flicker/shake
(function(){
    const video = document.getElementById('video');
    const overlayToggle = document.getElementById('overlay-toggle');
    const grade = document.querySelector('.grade');
    const grain = document.querySelector('.grain');
    const glitch = document.querySelector('.glitch');

    function rampVolume(target=0.7, duration=1600){
        if(!video) return;
        const start = (typeof video.volume === 'number') ? video.volume : 0;
        const diff = target - start;
        const steps = 30;
        let i = 0;
        const t = setInterval(()=>{
            i++; video.volume = Math.min(1, Math.max(0, start + diff * (i/steps)));
            if(i>=steps) clearInterval(t);
        }, Math.max(10, Math.floor(duration/steps)));
    }

    function startPlayback(){
        try{ if(video) { video.play(); } }catch(e){}
        rampVolume(0.7, 1400);
    }

    // Attach to the overlay toggle so the user-gesture triggers media
    const overlayLabel = document.querySelector('.overlay label');
    if(overlayLabel){
        overlayLabel.addEventListener('click', (ev)=>{
            // prevent the label's native toggle (which can conflict) and handle toggle here
            ev.preventDefault();
            ev.stopPropagation();
            // ensure playback starts
            setTimeout(()=> startPlayback(), 120);
            // explicitly check the overlay checkbox so CSS hides the overlay immediately
            if(overlayToggle) overlayToggle.checked = true;
            startEntranceAnimation();
        });
    }

    // Also listen to the checkbox change in case label toggles it
    if(overlayToggle){
        overlayToggle.addEventListener('change', ()=>{
            if(overlayToggle.checked){
                // when overlay is checked (enter), add entered state
                startEntranceAnimation();
            }
        });
    }

    // Entrance animation sequence
    function startEntranceAnimation(){
        // prevent double-run
        if(document.documentElement.classList.contains('entering')) return;
        document.documentElement.classList.add('entering');

        // visually create flash, rgb and burst elements
        const flash = document.createElement('div'); flash.className = 'enter-flash';
        const rgb = document.createElement('div'); rgb.className = 'enter-rgb';
        const burst = document.createElement('div'); burst.className = 'burst-lines';
        document.body.appendChild(flash); document.body.appendChild(rgb); document.body.appendChild(burst);

        // add title glitch class (uses data-text attribute to duplicate layers)
        const title = document.querySelector('.text-content h1');
        if(title){ title.classList.add('title-glitch'); title.setAttribute('data-text', title.textContent); }

        // brief stronger glitch pulse
        if(glitch){ glitch.style.opacity = 0.6; setTimeout(()=> glitch.style.opacity = 0.22, 700); }

        // ensure overlay checkbox is checked to hide overlay
        if(overlayToggle) overlayToggle.checked = true;

        // after animations, add entered class and cleanup
        const cleanupDelay = 900; // ms - matches CSS durations
        setTimeout(()=>{
            document.documentElement.classList.add('entered');
        }, 360);
        setTimeout(()=>{
            // remove temporary nodes
            flash.remove(); rgb.remove(); burst.remove();
            if(title){ title.classList.remove('title-glitch'); }
            document.documentElement.classList.remove('entering');
        }, cleanupDelay + 420);
    }

    // Parallax / subtle movement based on mouse for cinematic feel
    window.addEventListener('mousemove', (e)=>{
        const w = window.innerWidth, h = window.innerHeight;
        const rx = (e.clientX - w/2) / (w/2);
        const ry = (e.clientY - h/2) / (h/2);
        const tx = rx * 6; const ty = ry * 4;
        if(video) video.style.transform = `translate(-50%,-50%) translate3d(${tx}px, ${ty}px, 0) scale(1.02)`;
        if(grade) grade.style.transform = `translate3d(${tx/2}px, ${ty/2}px,0)`;
        if(grain) grain.style.transform = `translate3d(${tx/3}px, ${ty/3}px,0)`;
    });

    // occasional quick shake/glitch to mimic car-chase cuts
    function occasionalGlitch(){
        if(!glitch) return;
        const t = Math.random()*7000 + 3000;
        setTimeout(()=>{
            glitch.classList.add('shake');
            setTimeout(()=> glitch.classList.remove('shake'), 300);
            // small film flicker via opacity tweak
            if(grain) { grain.style.opacity = 0.6; setTimeout(()=>grain.style.opacity = 0.45, 220); }
            occasionalGlitch();
        }, t);
    }
    occasionalGlitch();

    // Accessibility: if user prefers reduced motion, disable the moving transforms
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if(mq && mq.matches){
        window.removeEventListener('mousemove', ()=>{});
        if(video) video.style.transform = 'translate(-50%,-50%) scale(1.02)';
    }

})();
