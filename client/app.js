// app.js to send events to the server

const videoFeed = document.getElementById('video_feed');
videoFeed.tabIndex = 0;

function getRelativePos(e) {
    const r = videoFeed.getBoundingClientRect();
    return {
        x: (e.clientX - r.left) / r.width,
        y: (e.clientY - r.top) / r.height
    };
}


videoFeed.addEventListener('click', async (e) => {
    e.preventDefault();
    const pos = getRelativePos(e);

    try {
        const res = await fetch('/click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pos)
        });
        console.log('click ok');
    } catch (err) {
        console.warn('click failed', err);
    }
});


let lastMove = 0;
const MOVE_DELAY = 60;

videoFeed.addEventListener('mousemove', async (e) => {
    const t = Date.now();
    if (t - lastMove < MOVE_DELAY) return;
    lastMove = t;

    const pos = getRelativePos(e);

    try {
        await fetch('/move', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pos)
        });
    } catch (err) {
        console.warn('move err', err);
    }
});

let lastScroll = 0;
const SCROLL_DELAY = 120;

videoFeed.addEventListener('wheel', async (e) => {
    e.preventDefault();

    const t = Date.now();
    if (t - lastScroll < SCROLL_DELAY) return;
    lastScroll = t;

    const amount = Math.sign(e.deltaY) * -10;

    try {
        await fetch('/scroll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ y: amount })
        });
    } catch (err) {
        console.warn('scroll err', err);
    }
});


const heldKeys = new Set();

document.addEventListener('keydown', async (e) => {
    const active = document.activeElement === videoFeed || videoFeed.matches(':hover');
    if (!active) return;


    if (heldKeys.has(e.key)) return;
    heldKeys.add(e.key);

    e.preventDefault();

    try {
        await fetch('/key', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: e.key, action: 'down' })
        });
    } catch (err) {
        console.warn('key down failed', err);
    }
});

document.addEventListener('keyup', async (e) => {
    if (!heldKeys.has(e.key)) return;

    heldKeys.delete(e.key);
    e.preventDefault();

    try {
        await fetch('/key', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: e.key, action: 'up' })
        });
    } catch (err) {
        console.warn('key up failed', err);
    }
});


videoFeed.addEventListener('focus', () => {
    document.getElementById('overlay').classList.remove('show');
});

videoFeed.addEventListener('blur', () => {
    document.getElementById('overlay').classList.add('show');
});


let lastResolution = { width: 0, height: 0 };

videoFeed.addEventListener('load', () => {
    const w = videoFeed.naturalWidth;
    const h = videoFeed.naturalHeight;

    if (w !== lastResolution.width || h !== lastResolution.height) {
        lastResolution = { width: w, height: h };
        document.getElementById('resolution').textContent = `${w}x${h}`;
    }
});


videoFeed.addEventListener('click', () => {
    document.getElementById('overlay').classList.remove('show');
}, { once: true });


const wrapper = document.getElementById('video_wrapper');
const fsBtn = document.getElementById('fullscreen_btn');

fsBtn.addEventListener('click', async () => {
    if (!document.fullscreenElement) {
        try {
            await wrapper.requestFullscreen();
            wrapper.classList.add('fullscreen');
        } catch (err) {
            console.warn('Fullscreen failed:', err);
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            wrapper.classList.remove('fullscreen');
        }
    }
});

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        wrapper.classList.remove('fullscreen');
    }
});


// update settings from slider
const updateSetting = async (key, value) => {
    try {
        await fetch('/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [key]: value })
        });
    } catch (err) {
        console.warn(`Failed to update ${key}:`, err);
    }
};

// setup sliders
const setupSlider = (id, valueId, key, formatter = v => v) => {
    document.getElementById(id).addEventListener('input', (e) => {
        const val = e.target.value;
        document.getElementById(valueId).textContent = formatter(val);
        updateSetting(key, val);
    });
};

setupSlider('scale_slider', 'scale_value', 'scale', v => `${Math.round(v * 100)}%`);
setupSlider('fps_slider', 'fps_value', 'fps');
setupSlider('quality_slider', 'quality_value', 'quality', v => `${v}%`);


const endBtn = document.getElementById('end-btn');
endBtn.addEventListener('click', async () => {
    try {
        await fetch('/end', {
            method: 'POST'
        });
    } catch (err) {
        console.warn('End failed:', err);
    }
});


console.log('remote control input initialized');
