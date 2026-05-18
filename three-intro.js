// ================================================================
//  THREE.JS 3D INTRO — Person at desk, camera sits down at POV
// ================================================================
(function() {
    var container = document.getElementById('intro-container');
    var introTitle = document.getElementById('introTitle');
    var introHint = document.getElementById('introHint');
    var fadeout = document.getElementById('intro-fadeout');

    var GREEN = new THREE.Color(0x00FF41);
    var DARK_GREEN = new THREE.Color(0x003300);

    // ---- Renderer / Scene / Camera ----
    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.04);

    var camera = new THREE.PerspectiveCamera(
        50, window.innerWidth / window.innerHeight, 0.05, 120
    );
    camera.position.set(0, 2.6, 7.5);
    camera.lookAt(0, 1.2, 0);

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    container.insertBefore(renderer.domElement, container.firstChild);

    // ---- Shared materials ----
    function wireMat(opacity) {
        return new THREE.MeshBasicMaterial({
            color: GREEN.clone(), wireframe: true,
            transparent: true, opacity: opacity
        });
    }
    function solidMat(opacity, col) {
        return new THREE.MeshBasicMaterial({
            color: (col || GREEN).clone(), transparent: true, opacity: opacity
        });
    }

    var charMaterial = wireMat(0.28);
    var deskMaterial = wireMat(0.35);
    var roomMaterial = wireMat(0.07);
    var accentMaterial = wireMat(0.22);

    // ============================================================
    //  ROOM
    // ============================================================
    var floor = new THREE.Mesh(
        new THREE.PlaneGeometry(24, 24, 24, 24), roomMaterial
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Circuit board traces on the floor
    var circuitMat = new THREE.LineBasicMaterial({ color: GREEN, transparent: true, opacity: 0.06 });
    var circuits = [
        [[0,0.01,-0.5],[0,0.01,-3],[2,0.01,-3],[2,0.01,-4]],
        [[0.5,0.01,0],[0.5,0.01,-2],[3,0.01,-2],[3,0.01,-3.5]],
        [[-0.5,0.01,0],[-0.5,0.01,-2],[-3,0.01,-2],[-3,0.01,-1],[-5,0.01,-1]],
        [[1.3,0.01,0],[1.3,0.01,-1.5],[4,0.01,-1.5]],
        [[-1.3,0.01,0],[-1.3,0.01,-2.5],[-4,0.01,-2.5],[-4,0.01,-4]],
        [[0,0.01,1],[2,0.01,1],[2,0.01,3],[4,0.01,3]],
        [[0,0.01,1],[-2,0.01,1],[-2,0.01,4],[-5,0.01,4]],
        [[0.8,0.01,0.5],[3.5,0.01,0.5],[3.5,0.01,2]],
        [[-0.8,0.01,0.5],[-3.5,0.01,0.5],[-3.5,0.01,-0.5],[-6,0.01,-0.5]],
    ];
    circuits.forEach(function(pts) {
        var vecs = pts.map(function(p) { return new THREE.Vector3(p[0], p[1], p[2]); });
        var geo = new THREE.BufferGeometry().setFromPoints(vecs);
        scene.add(new THREE.Line(geo, circuitMat));
        // Add a small dot at each corner
        vecs.forEach(function(v) {
            var dot = new THREE.Mesh(
                new THREE.CircleGeometry(0.04, 6),
                solidMat(0.06, GREEN)
            );
            dot.rotation.x = -Math.PI / 2;
            dot.position.copy(v);
            dot.position.y = 0.012;
            scene.add(dot);
        });
    });

    var backWall = new THREE.Mesh(
        new THREE.PlaneGeometry(24, 10, 24, 10), wireMat(0.04)
    );
    backWall.position.set(0, 5, -4);
    scene.add(backWall);

    var sideWallGeo = new THREE.PlaneGeometry(16, 10, 12, 8);
    var leftWall = new THREE.Mesh(sideWallGeo, wireMat(0.025));
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-8, 5, 0);
    scene.add(leftWall);
    var rightWall = new THREE.Mesh(sideWallGeo, wireMat(0.025));
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(8, 5, 0);
    scene.add(rightWall);

    var ceiling = new THREE.Mesh(
        new THREE.PlaneGeometry(24, 24, 12, 12), wireMat(0.02)
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 6;
    scene.add(ceiling);

    // ============================================================
    //  DESK
    // ============================================================
    var deskTop = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.07, 1.1), deskMaterial
    );
    deskTop.position.set(0, 0.76, 0);
    scene.add(deskTop);

    var legGeo = new THREE.BoxGeometry(0.06, 0.76, 0.06);
    [[-1.2,0.38,0.45],[1.2,0.38,0.45],[-1.2,0.38,-0.45],[1.2,0.38,-0.45]].forEach(function(p) {
        var leg = new THREE.Mesh(legGeo, deskMaterial);
        leg.position.set(p[0], p[1], p[2]);
        scene.add(leg);
    });

    var tray = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.04, 0.2), wireMat(0.12)
    );
    tray.position.set(0, 0.1, -0.3);
    scene.add(tray);

    // ============================================================
    //  MONITOR + CRT SCREEN
    // ============================================================
    var monitorHousing = new THREE.Mesh(
        new THREE.BoxGeometry(1.32, 0.88, 0.1), wireMat(0.4)
    );
    monitorHousing.position.set(0, 1.26, -0.25);
    scene.add(monitorHousing);

    var bezel = new THREE.Mesh(
        new THREE.BoxGeometry(1.28, 0.84, 0.08), solidMat(0.08)
    );
    bezel.position.set(0, 1.26, -0.24);
    scene.add(bezel);

    var standNeck = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.36, 0.12), deskMaterial
    );
    standNeck.position.set(0, 0.98, -0.25);
    scene.add(standNeck);

    var standBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.04, 0.3), deskMaterial
    );
    standBase.position.set(0, 0.80, -0.25);
    scene.add(standBase);

    // CRT Screen canvas
    var screenCanvas = document.createElement('canvas');
    screenCanvas.width = 640;
    screenCanvas.height = 420;
    var sCtx = screenCanvas.getContext('2d');
    var screenTexture = new THREE.CanvasTexture(screenCanvas);
    screenTexture.minFilter = THREE.LinearFilter;

    var screenMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.18, 0.74),
        new THREE.MeshBasicMaterial({ map: screenTexture, transparent: true, opacity: 0.95 })
    );
    screenMesh.position.set(0, 1.26, -0.188);
    scene.add(screenMesh);

    // Growing graph on main monitor
    var graphStartTime = performance.now();
    // Generate graph data points — exponential growth curve with noise
    var graphPoints = [];
    var GRAPH_TOTAL = 80;
    for (var gi = 0; gi < GRAPH_TOTAL; gi++) {
        var base = Math.pow(gi / GRAPH_TOTAL, 2.2);
        var noise = (Math.random() - 0.5) * 0.06;
        graphPoints.push(Math.max(0, Math.min(1, base + noise)));
    }

    function renderScreen(time) {
        var W = 640, H = 420;
        var PAD_L = 55, PAD_R = 30, PAD_T = 55, PAD_B = 50;
        var graphW = W - PAD_L - PAD_R;
        var graphH = H - PAD_T - PAD_B;

        // How many points to reveal (grows over ~8 seconds)
        var elapsed = (time - graphStartTime) / 1000;
        var reveal = Math.min(GRAPH_TOTAL, Math.floor(elapsed * 30));

        // Background
        sCtx.fillStyle = '#0a0a0a';
        sCtx.fillRect(0, 0, W, H);

        // Title
        sCtx.font = 'bold 15px monospace';
        sCtx.fillStyle = '#00FF41';
        sCtx.textBaseline = 'top';
        sCtx.fillText('DEBUT — GROWTH', PAD_L, 18);

        // Axis lines
        sCtx.strokeStyle = 'rgba(0,255,65,0.25)';
        sCtx.lineWidth = 1;
        sCtx.beginPath();
        sCtx.moveTo(PAD_L, PAD_T);
        sCtx.lineTo(PAD_L, PAD_T + graphH);
        sCtx.lineTo(PAD_L + graphW, PAD_T + graphH);
        sCtx.stroke();

        // Grid lines
        sCtx.strokeStyle = 'rgba(0,255,65,0.07)';
        for (var gy = 0; gy < 5; gy++) {
            var yy = PAD_T + graphH * (gy / 4);
            sCtx.beginPath();
            sCtx.moveTo(PAD_L, yy);
            sCtx.lineTo(PAD_L + graphW, yy);
            sCtx.stroke();
        }

        // Draw filled area under curve
        if (reveal > 1) {
            sCtx.beginPath();
            sCtx.moveTo(PAD_L, PAD_T + graphH);
            for (var pi = 0; pi < reveal; pi++) {
                var px = PAD_L + (pi / (GRAPH_TOTAL - 1)) * graphW;
                var py = PAD_T + graphH - graphPoints[pi] * graphH;
                if (pi === 0) sCtx.lineTo(px, py);
                else sCtx.lineTo(px, py);
            }
            var lastX = PAD_L + ((reveal - 1) / (GRAPH_TOTAL - 1)) * graphW;
            sCtx.lineTo(lastX, PAD_T + graphH);
            sCtx.closePath();
            var areaGrad = sCtx.createLinearGradient(0, PAD_T, 0, PAD_T + graphH);
            areaGrad.addColorStop(0, 'rgba(0,255,65,0.15)');
            areaGrad.addColorStop(1, 'rgba(0,255,65,0.02)');
            sCtx.fillStyle = areaGrad;
            sCtx.fill();

            // Draw the line
            sCtx.beginPath();
            for (var pi2 = 0; pi2 < reveal; pi2++) {
                var lx = PAD_L + (pi2 / (GRAPH_TOTAL - 1)) * graphW;
                var ly = PAD_T + graphH - graphPoints[pi2] * graphH;
                if (pi2 === 0) sCtx.moveTo(lx, ly);
                else sCtx.lineTo(lx, ly);
            }
            sCtx.strokeStyle = '#00FF41';
            sCtx.lineWidth = 2.5;
            sCtx.shadowColor = '#00FF41';
            sCtx.shadowBlur = 8;
            sCtx.stroke();
            sCtx.shadowBlur = 0;

            // Glowing dot at the tip
            var tipX = PAD_L + ((reveal - 1) / (GRAPH_TOTAL - 1)) * graphW;
            var tipY = PAD_T + graphH - graphPoints[reveal - 1] * graphH;
            sCtx.beginPath();
            sCtx.arc(tipX, tipY, 4, 0, Math.PI * 2);
            sCtx.fillStyle = '#00FF41';
            sCtx.shadowColor = '#00FF41';
            sCtx.shadowBlur = 12;
            sCtx.fill();
            sCtx.shadowBlur = 0;

            // Value label at tip
            var pct = Math.round(graphPoints[reveal - 1] * 100);
            sCtx.font = 'bold 13px monospace';
            sCtx.fillStyle = '#00FF41';
            sCtx.fillText(pct + '%', tipX + 8, tipY - 6);
        }

        // Y-axis labels
        sCtx.font = '11px monospace';
        sCtx.fillStyle = 'rgba(0,255,65,0.4)';
        sCtx.textAlign = 'right';
        sCtx.textBaseline = 'middle';
        for (var yl = 0; yl <= 4; yl++) {
            sCtx.fillText((yl * 25) + '%', PAD_L - 8, PAD_T + graphH - (yl / 4) * graphH);
        }
        sCtx.textAlign = 'left';

        // X-axis label
        sCtx.font = '11px monospace';
        sCtx.fillStyle = 'rgba(0,255,65,0.35)';
        sCtx.textBaseline = 'top';
        sCtx.fillText('TIME', PAD_L + graphW - 25, PAD_T + graphH + 12);

        // Restart the graph when it finishes
        if (reveal >= GRAPH_TOTAL && elapsed > (GRAPH_TOTAL / 30) + 2) {
            graphStartTime = time;
        }

        // CRT scanlines
        sCtx.fillStyle = 'rgba(0, 0, 0, 0.10)';
        for (var sy = 0; sy < H; sy += 3) { sCtx.fillRect(0, sy, W, 1); }

        // Vignette
        var grad = sCtx.createRadialGradient(W/2, H/2, W*0.28, W/2, H/2, W*0.65);
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, 'rgba(0,0,0,0.4)');
        sCtx.fillStyle = grad;
        sCtx.fillRect(0, 0, W, H);

        // Screen edge glow
        sCtx.strokeStyle = 'rgba(0,255,65,0.06)';
        sCtx.lineWidth = 4;
        sCtx.strokeRect(2, 2, W - 4, H - 4);

        screenTexture.needsUpdate = true;
    }

    // ============================================================
    //  KEYBOARD + ACCESSORIES
    // ============================================================
    var kb = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.025, 0.22), deskMaterial
    );
    kb.position.set(0, 0.79, 0.22);
    scene.add(kb);
    for (var row = 0; row < 4; row++) {
        for (var col = 0; col < 12; col++) {
            var key = new THREE.Mesh(
                new THREE.BoxGeometry(0.04, 0.012, 0.035), wireMat(0.15)
            );
            key.position.set(-0.26 + col * 0.048, 0.806, 0.14 + row * 0.045);
            scene.add(key);
        }
    }
    var mouse = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.025, 0.12), deskMaterial);
    mouse.position.set(0.55, 0.79, 0.25);
    scene.add(mouse);
    var pad = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.005, 0.25), wireMat(0.08));
    pad.position.set(0.55, 0.78, 0.25);
    scene.add(pad);

    // Coffee mug
    var mug = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.1, 8, 1, true), wireMat(0.25));
    mug.position.set(-0.9, 0.84, 0.15);
    scene.add(mug);
    var mugBottom = new THREE.Mesh(new THREE.CircleGeometry(0.04, 8), wireMat(0.15));
    mugBottom.rotation.x = -Math.PI / 2;
    mugBottom.position.set(-0.9, 0.79, 0.15);
    scene.add(mugBottom);

    // Plant
    var pot = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.08, 6), wireMat(0.2));
    pot.position.set(1.0, 0.83, -0.15);
    scene.add(pot);
    var plant = new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 0), wireMat(0.22));
    plant.position.set(1.0, 0.92, -0.15);
    scene.add(plant);

    // Books
    for (var b = 0; b < 3; b++) {
        var book = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.035, 0.12), wireMat(0.15 + b * 0.04));
        book.position.set(-1.0, 0.80 + b * 0.038, -0.2);
        book.rotation.y = 0.1 * (b - 1);
        scene.add(book);
    }

    // Cable
    var cablePoints = [];
    for (var ci = 0; ci <= 12; ci++) {
        var ct = ci / 12;
        cablePoints.push(new THREE.Vector3(0.15 + Math.sin(ct * 2) * 0.05, 0.80 - ct * 0.7, -0.25 + ct * 0.15));
    }
    var cableCurve = new THREE.CatmullRomCurve3(cablePoints);
    var cableGeo = new THREE.BufferGeometry().setFromPoints(cableCurve.getPoints(20));
    scene.add(new THREE.Line(cableGeo, new THREE.LineBasicMaterial({ color: GREEN, transparent: true, opacity: 0.12 })));

    // ============================================================
    //  SECOND MONITOR (smaller, angled to the right)
    // ============================================================
    var mon2Housing = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.58, 0.06), wireMat(0.3)
    );
    mon2Housing.position.set(1.15, 1.18, -0.35);
    mon2Housing.rotation.y = -0.4;
    scene.add(mon2Housing);
    // Second screen — static green with code-like content
    var mon2Canvas = document.createElement('canvas');
    mon2Canvas.width = 320; mon2Canvas.height = 210;
    var m2Ctx = mon2Canvas.getContext('2d');
    var mon2Tex = new THREE.CanvasTexture(mon2Canvas);
    mon2Tex.minFilter = THREE.LinearFilter;
    var mon2Screen = new THREE.Mesh(
        new THREE.PlaneGeometry(0.78, 0.5),
        new THREE.MeshBasicMaterial({ map: mon2Tex, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
    );
    mon2Screen.position.set(1.15, 1.18, -0.315);
    mon2Screen.rotation.y = -0.4;
    scene.add(mon2Screen);
    var mon2Stand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.25, 0.08), deskMaterial);
    mon2Stand.position.set(1.15, 0.92, -0.35);
    scene.add(mon2Stand);
    var mon2Base = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 0.2), deskMaterial);
    mon2Base.position.set(1.15, 0.80, -0.35);
    scene.add(mon2Base);

    // Code lines on second monitor
    var mon2Lines = [
        'import { Debut } from "@debut/core";',
        '',
        'const app = new Debut({',
        '  mode: "discover",',
        '  swipe: true,',
        '  notifications: true,',
        '});',
        '',
        'app.onMatch((job) => {',
        '  console.log("Match:", job.title);',
        '  return job.apply();',
        '});',
        '',
        'app.listen(3000);',
    ];
    function renderMon2(time) {
        var W = 320, H = 210;
        m2Ctx.fillStyle = '#0a0a0a';
        m2Ctx.fillRect(0, 0, W, H);
        m2Ctx.font = '10px monospace';
        var scrollOffset = Math.floor(time / 3000) % 3;
        for (var i = 0; i < mon2Lines.length; i++) {
            var lineAlpha = 0.35 + Math.sin(time / 1000 + i * 0.5) * 0.15;
            // Syntax coloring: keywords brighter
            var line = mon2Lines[i];
            if (line.match(/^(import|const|return|from)/)) {
                m2Ctx.fillStyle = 'rgba(0,255,65,' + (lineAlpha + 0.2) + ')';
            } else if (line.match(/\/\//)) {
                m2Ctx.fillStyle = 'rgba(0,255,65,' + (lineAlpha - 0.1) + ')';
            } else {
                m2Ctx.fillStyle = 'rgba(0,255,65,' + lineAlpha + ')';
            }
            m2Ctx.fillText(line, 10, 16 + i * 14);
        }
        // Cursor on second monitor
        if (Math.floor(time / 600) % 2 === 0) {
            m2Ctx.fillStyle = 'rgba(0,255,65,0.6)';
            m2Ctx.fillRect(10, 16 + mon2Lines.length * 14 - 2, 6, 11);
        }
        // Scanlines
        m2Ctx.fillStyle = 'rgba(0,0,0,0.08)';
        for (var y = 0; y < H; y += 3) m2Ctx.fillRect(0, y, W, 1);
        mon2Tex.needsUpdate = true;
    }

    // ============================================================
    //  PC TOWER under desk (with glass side panel, fan, components)
    // ============================================================
    var pcGroup = new THREE.Group();
    // Case
    var pcCase = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.55, 0.4), wireMat(0.2));
    pcCase.position.set(0, 0.275, 0);
    pcGroup.add(pcCase);
    // Glass side panel (transparent)
    var pcGlass = new THREE.Mesh(
        new THREE.PlaneGeometry(0.33, 0.53),
        solidMat(0.06, GREEN)
    );
    pcGlass.position.set(-0.176, 0.275, 0);
    pcGlass.rotation.y = -Math.PI / 2;
    pcGroup.add(pcGlass);
    // Motherboard (inside)
    var pcMobo = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.45), wireMat(0.1));
    pcMobo.position.set(0.1, 0.275, 0);
    pcMobo.rotation.y = -Math.PI / 2;
    pcGroup.add(pcMobo);
    // GPU (horizontal card)
    var pcGPU = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.04, 0.12), wireMat(0.18));
    pcGPU.position.set(0, 0.18, 0);
    pcGroup.add(pcGPU);
    // RAM sticks
    for (var ri = 0; ri < 2; ri++) {
        var ram = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, 0.08), wireMat(0.15));
        ram.position.set(0.05 - ri * 0.04, 0.42, 0.05);
        pcGroup.add(ram);
    }
    // Fan (spinning ring)
    var fanRing = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.008, 6, 24), wireMat(0.25));
    fanRing.position.set(-0.05, 0.38, 0);
    pcGroup.add(fanRing);
    // Fan blades (cross)
    var fanBlade1 = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.015), wireMat(0.2));
    fanBlade1.position.copy(fanRing.position);
    pcGroup.add(fanBlade1);
    var fanBlade2 = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.015), wireMat(0.2));
    fanBlade2.position.copy(fanRing.position);
    fanBlade2.rotation.z = Math.PI / 2;
    pcGroup.add(fanBlade2);
    var fanBlade3 = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.015), wireMat(0.15));
    fanBlade3.position.copy(fanRing.position);
    fanBlade3.rotation.z = Math.PI / 4;
    pcGroup.add(fanBlade3);
    var fanBlade4 = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.015), wireMat(0.15));
    fanBlade4.position.copy(fanRing.position);
    fanBlade4.rotation.z = -Math.PI / 4;
    pcGroup.add(fanBlade4);
    // PC internal LEDs
    var pcLed1 = new THREE.Mesh(new THREE.SphereGeometry(0.01, 4, 3), solidMat(0.8, GREEN));
    pcLed1.position.set(-0.05, 0.5, 0.08);
    pcGroup.add(pcLed1);
    var pcLed2 = new THREE.Mesh(new THREE.SphereGeometry(0.01, 4, 3), solidMat(0.5, GREEN));
    pcLed2.position.set(-0.05, 0.1, -0.1);
    pcGroup.add(pcLed2);
    // Internal glow
    var pcGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.5), solidMat(0.02, GREEN));
    pcGlow.position.set(-0.17, 0.275, 0);
    pcGlow.rotation.y = -Math.PI / 2;
    pcGroup.add(pcGlow);

    pcGroup.position.set(-0.9, 0, 0.2);
    pcGroup.rotation.y = 0.15;
    scene.add(pcGroup);

    // Cable from PC to monitor
    var pcCablePoints = [
        new THREE.Vector3(-0.75, 0.55, 0.1),
        new THREE.Vector3(-0.6, 0.65, -0.05),
        new THREE.Vector3(-0.3, 0.72, -0.15),
        new THREE.Vector3(-0.1, 0.78, -0.2),
        new THREE.Vector3(0, 0.80, -0.25),
    ];
    var pcCableCurve = new THREE.CatmullRomCurve3(pcCablePoints);
    var pcCableGeo = new THREE.BufferGeometry().setFromPoints(pcCableCurve.getPoints(16));
    scene.add(new THREE.Line(pcCableGeo, new THREE.LineBasicMaterial({ color: GREEN, transparent: true, opacity: 0.1 })));

    // ============================================================
    //  LED DESK UNDERGLOW
    // ============================================================
    var ledStripMat = solidMat(0.08, GREEN);
    // Front edge
    var ledFront = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 0.03), ledStripMat);
    ledFront.position.set(0, 0.73, 0.55);
    scene.add(ledFront);
    // Side edges
    var ledLeft = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.03), ledStripMat);
    ledLeft.position.set(-1.25, 0.73, 0.05);
    ledLeft.rotation.y = Math.PI / 2;
    scene.add(ledLeft);
    var ledRight = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.03), ledStripMat);
    ledRight.position.set(1.25, 0.73, 0.05);
    ledRight.rotation.y = Math.PI / 2;
    scene.add(ledRight);
    // Floor glow from LED strip
    var ledFloorGlow = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.4), solidMat(0.015, GREEN));
    ledFloorGlow.rotation.x = -Math.PI / 2;
    ledFloorGlow.position.set(0, 0.003, 0.1);
    scene.add(ledFloorGlow);

    // ============================================================
    //  HEADPHONES on desk
    // ============================================================
    // Headband arc
    var hpCurvePoints = [];
    for (var hpi = 0; hpi <= 16; hpi++) {
        var a = (hpi / 16) * Math.PI;
        hpCurvePoints.push(new THREE.Vector3(
            Math.cos(a) * 0.08,
            0.84 + Math.sin(a) * 0.06,
            -0.38
        ));
    }
    var hpCurve = new THREE.CatmullRomCurve3(hpCurvePoints);
    var hpGeo = new THREE.BufferGeometry().setFromPoints(hpCurve.getPoints(20));
    scene.add(new THREE.Line(hpGeo, new THREE.LineBasicMaterial({ color: GREEN, transparent: true, opacity: 0.2 })));
    // Ear cups
    var earCupGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.03, 8);
    var earL = new THREE.Mesh(earCupGeo, wireMat(0.22));
    earL.position.set(-0.08, 0.84, -0.38);
    earL.rotation.z = Math.PI / 2;
    scene.add(earL);
    var earR = new THREE.Mesh(earCupGeo, wireMat(0.22));
    earR.position.set(0.08, 0.84, -0.38);
    earR.rotation.z = Math.PI / 2;
    scene.add(earR);

    // ============================================================
    //  ANIMATED KEYBOARD KEYS (store references)
    // ============================================================
    var keyMeshes = [];
    // Replace the static keys - remove old ones above by overriding
    // (the old keys are still in the scene but we'll add animated ones on top)
    for (var krow = 0; krow < 4; krow++) {
        for (var kcol = 0; kcol < 12; kcol++) {
            var animKey = new THREE.Mesh(
                new THREE.BoxGeometry(0.038, 0.018, 0.033),
                solidMat(0.12, GREEN)
            );
            animKey.position.set(-0.26 + kcol * 0.048, 0.812, 0.14 + krow * 0.045);
            animKey.userData.baseY = 0.812;
            animKey.userData.idx = krow * 12 + kcol;
            scene.add(animKey);
            keyMeshes.push(animKey);
        }
    }

    // ============================================================
    //  SPEAKERS (small pair on desk sides)
    // ============================================================
    var spkGeo = new THREE.BoxGeometry(0.08, 0.14, 0.08);
    var spkL = new THREE.Mesh(spkGeo, wireMat(0.18));
    spkL.position.set(-0.65, 0.86, -0.3);
    scene.add(spkL);
    var spkR = new THREE.Mesh(spkGeo, wireMat(0.18));
    spkR.position.set(0.65, 0.86, -0.3);
    scene.add(spkR);
    // Speaker cones
    var coneGeo = new THREE.CircleGeometry(0.025, 8);
    var spkConeL = new THREE.Mesh(coneGeo, solidMat(0.1, GREEN));
    spkConeL.position.set(-0.65, 0.88, -0.259);
    scene.add(spkConeL);
    var spkConeR = new THREE.Mesh(coneGeo, solidMat(0.1, GREEN));
    spkConeR.position.set(0.65, 0.88, -0.259);
    scene.add(spkConeR);

    // ============================================================
    //  CHARACTER — seated wireframe figure
    // ============================================================
    var charGroup = new THREE.Group();

    var head = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 1), charMaterial);
    head.position.set(0, 1.56, 1.15);
    charGroup.add(head);

    // Glowing eyes
    var eyeMat = solidMat(0.7, GREEN);
    var leftEye = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 4), eyeMat);
    leftEye.position.set(-0.06, 1.57, 1.02);
    charGroup.add(leftEye);
    var rightEye = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 4), eyeMat);
    rightEye.position.set(0.06, 1.57, 1.02);
    charGroup.add(rightEye);

    // Hair spikes
    for (var hi = 0; hi < 5; hi++) {
        var spike = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.08, 4), wireMat(0.18));
        var ha = (hi / 5) * Math.PI - Math.PI * 0.4;
        spike.position.set(Math.sin(ha) * 0.1, 1.72 + Math.random() * 0.03, 1.15 + Math.cos(ha) * 0.06);
        spike.rotation.z = (Math.random() - 0.5) * 0.4;
        charGroup.add(spike);
    }

    var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.1, 6), charMaterial);
    neck.position.set(0, 1.44, 1.15);
    charGroup.add(neck);

    var torso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.5, 0.24), charMaterial);
    torso.position.set(0, 1.13, 1.22);
    torso.rotation.x = -0.12;
    charGroup.add(torso);

    var shoulderGeo = new THREE.SphereGeometry(0.055, 6, 4);
    var leftShoulder = new THREE.Mesh(shoulderGeo, charMaterial);
    leftShoulder.position.set(-0.28, 1.33, 1.2);
    charGroup.add(leftShoulder);
    var rightShoulder = new THREE.Mesh(shoulderGeo, charMaterial);
    rightShoulder.position.set(0.28, 1.33, 1.2);
    charGroup.add(rightShoulder);

    var upperArmGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.3, 6);
    var leftUpperArm = new THREE.Mesh(upperArmGeo, charMaterial);
    leftUpperArm.position.set(-0.32, 1.18, 1.12);
    leftUpperArm.rotation.x = -0.6; leftUpperArm.rotation.z = 0.25;
    charGroup.add(leftUpperArm);
    var rightUpperArm = new THREE.Mesh(upperArmGeo, charMaterial);
    rightUpperArm.position.set(0.32, 1.18, 1.12);
    rightUpperArm.rotation.x = -0.6; rightUpperArm.rotation.z = -0.25;
    charGroup.add(rightUpperArm);

    var elbowGeo = new THREE.SphereGeometry(0.04, 5, 3);
    var leftElbow = new THREE.Mesh(elbowGeo, charMaterial);
    leftElbow.position.set(-0.3, 1.02, 0.88);
    charGroup.add(leftElbow);
    var rightElbow = new THREE.Mesh(elbowGeo, charMaterial);
    rightElbow.position.set(0.3, 1.02, 0.88);
    charGroup.add(rightElbow);

    var forearmGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.32, 6);
    var leftForearm = new THREE.Mesh(forearmGeo, charMaterial);
    leftForearm.position.set(-0.22, 0.9, 0.6);
    leftForearm.rotation.x = -1.15; leftForearm.rotation.z = 0.15;
    charGroup.add(leftForearm);
    var rightForearm = new THREE.Mesh(forearmGeo, charMaterial);
    rightForearm.position.set(0.22, 0.9, 0.6);
    rightForearm.rotation.x = -1.15; rightForearm.rotation.z = -0.15;
    charGroup.add(rightForearm);

    var handGeo = new THREE.BoxGeometry(0.06, 0.03, 0.07);
    var leftHand = new THREE.Mesh(handGeo, charMaterial);
    leftHand.position.set(-0.15, 0.81, 0.32);
    charGroup.add(leftHand);
    var rightHand = new THREE.Mesh(handGeo, charMaterial);
    rightHand.position.set(0.15, 0.81, 0.32);
    charGroup.add(rightHand);

    var hips = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.22), charMaterial);
    hips.position.set(0, 0.82, 1.35);
    charGroup.add(hips);

    var upperLegGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.42, 6);
    var leftUpperLeg = new THREE.Mesh(upperLegGeo, charMaterial);
    leftUpperLeg.position.set(-0.13, 0.72, 1.1);
    leftUpperLeg.rotation.x = -Math.PI / 2 + 0.25;
    charGroup.add(leftUpperLeg);
    var rightUpperLeg = new THREE.Mesh(upperLegGeo, charMaterial);
    rightUpperLeg.position.set(0.13, 0.72, 1.1);
    rightUpperLeg.rotation.x = -Math.PI / 2 + 0.25;
    charGroup.add(rightUpperLeg);

    var kneeGeo = new THREE.SphereGeometry(0.05, 5, 3);
    var leftKnee = new THREE.Mesh(kneeGeo, charMaterial);
    leftKnee.position.set(-0.13, 0.62, 0.85);
    charGroup.add(leftKnee);
    var rightKnee = new THREE.Mesh(kneeGeo, charMaterial);
    rightKnee.position.set(0.13, 0.62, 0.85);
    charGroup.add(rightKnee);

    var lowerLegGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.42, 6);
    var leftLowerLeg = new THREE.Mesh(lowerLegGeo, charMaterial);
    leftLowerLeg.position.set(-0.13, 0.38, 0.82);
    leftLowerLeg.rotation.x = 0.15;
    charGroup.add(leftLowerLeg);
    var rightLowerLeg = new THREE.Mesh(lowerLegGeo, charMaterial);
    rightLowerLeg.position.set(0.13, 0.38, 0.82);
    rightLowerLeg.rotation.x = 0.15;
    charGroup.add(rightLowerLeg);

    var footGeo = new THREE.BoxGeometry(0.07, 0.035, 0.12);
    var leftFoot = new THREE.Mesh(footGeo, charMaterial);
    leftFoot.position.set(-0.13, 0.17, 0.78);
    charGroup.add(leftFoot);
    var rightFoot = new THREE.Mesh(footGeo, charMaterial);
    rightFoot.position.set(0.13, 0.17, 0.78);
    charGroup.add(rightFoot);

    scene.add(charGroup);

    // ============================================================
    //  CHAIR
    // ============================================================
    var chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.045, 0.48), accentMaterial);
    chairSeat.position.set(0, 0.58, 1.35);
    scene.add(chairSeat);
    var chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.55, 0.04), accentMaterial);
    chairBack.position.set(0, 0.88, 1.58);
    chairBack.rotation.x = 0.08;
    scene.add(chairBack);
    var chairCol = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 6), accentMaterial);
    chairCol.position.set(0, 0.38, 1.35);
    scene.add(chairCol);
    for (var si = 0; si < 5; si++) {
        var angle = (si / 5) * Math.PI * 2;
        var arm = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.025, 0.035), accentMaterial);
        arm.position.set(Math.sin(angle) * 0.17, 0.19, 1.35 + Math.cos(angle) * 0.17);
        arm.rotation.y = -angle;
        scene.add(arm);
        var wheel = new THREE.Mesh(new THREE.SphereGeometry(0.025, 4, 3), wireMat(0.15));
        wheel.position.set(Math.sin(angle) * 0.34, 0.17, 1.35 + Math.cos(angle) * 0.34);
        scene.add(wheel);
    }

    // ============================================================
    //  HOLOGRAPHIC FLOATING PANELS
    // ============================================================
    var holoPanels = [];

    function drawHoloPanel(ctx, W, H, t, panelType) {
        ctx.fillStyle = 'rgba(0, 8, 0, 0.88)';
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = 'rgba(0, 255, 65, 0.6)';
        ctx.lineWidth = 1;
        ctx.strokeRect(2, 2, W - 4, H - 4);

        ctx.fillStyle = 'rgba(0, 255, 65, 0.08)';
        ctx.fillRect(5, 5, W - 10, 20);
        ctx.fillStyle = 'rgba(0, 255, 65, 0.85)';
        ctx.font = 'bold 10px monospace';

        if (panelType === 0) {
            ctx.fillText('SYS.MONITOR // DEBUT.OS', 10, 19);
            ctx.font = '9px monospace';
            for (var hr = 0; hr < 6; hr++) {
                var line = '';
                for (var hc = 0; hc < 12; hc++) {
                    var v = Math.floor(Math.random() * 256);
                    if (Math.floor(t * 3) % 8 === hr) v = Math.floor(Math.abs(Math.sin(t * 5 + hc)) * 256);
                    line += ('0' + v.toString(16).toUpperCase()).slice(-2) + ' ';
                }
                ctx.fillStyle = 'rgba(0, 255, 65, ' + (0.3 + hr * 0.1) + ')';
                ctx.fillText(line, 8, 40 + hr * 14);
            }
            // Bar graph
            var labels = ['CPU','MEM','NET','DSK','GPU'];
            var vals = [0.45+Math.sin(t*1.3)*0.3, 0.62+Math.sin(t*0.7)*0.18, 0.28+Math.sin(t*2.1)*0.25, 0.15+Math.sin(t*0.4)*0.08, 0.71+Math.sin(t*1.7)*0.22];
            for (var bi = 0; bi < 5; bi++) {
                var bx = 8 + bi * 34, bv = Math.min(1, Math.max(0, vals[bi]));
                ctx.fillStyle = 'rgba(0, 255, 65, 0.06)';
                ctx.fillRect(bx, H - 45, 28, 28);
                ctx.fillStyle = 'rgba(0, 255, 65, ' + (0.3 + bv * 0.4) + ')';
                ctx.fillRect(bx, H - 45 + (28 - 28 * bv), 28, 28 * bv);
                ctx.fillStyle = 'rgba(0, 255, 65, 0.6)';
                ctx.font = '8px monospace';
                ctx.fillText(labels[bi], bx + 2, H - 10);
            }
        } else if (panelType === 1) {
            ctx.fillText('SIGNAL.TRACE // LIVE', 10, 19);
            // Waveform
            var wY = 28 + (H - 50) / 2, wA = (H - 50) / 2 - 8;
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(0, 255, 65, 0.8)';
            ctx.lineWidth = 1.5;
            for (var wx = 0; wx <= W - 16; wx += 2) {
                var ph = (wx / (W - 16)) * Math.PI * 6 - t * 3;
                var yy = wY + Math.sin(ph) * wA * 0.7 + Math.sin(ph * 2.3 + t) * wA * 0.2;
                if (wx === 0) ctx.moveTo(8 + wx, yy); else ctx.lineTo(8 + wx, yy);
            }
            ctx.stroke();
            // Grid
            ctx.strokeStyle = 'rgba(0, 255, 65, 0.06)';
            ctx.lineWidth = 0.5;
            for (var gi = 0; gi < 5; gi++) { var gy = 35 + gi * (H - 55) / 4; ctx.beginPath(); ctx.moveTo(8, gy); ctx.lineTo(W - 8, gy); ctx.stroke(); }
        } else {
            ctx.fillText('DEBUT.MATCH // PIPELINE', 10, 19);
            var entries = [
                { l: 'STRIPE  (SWE-II)', s: 94 },
                { l: 'VERCEL  (DEVREL)', s: 87 },
                { l: 'LINEAR  (PM)',     s: 81 },
                { l: 'FIGMA   (DESIGN)', s: 76 },
                { l: 'SUPABASE(SRE)',    s: 68 },
            ];
            ctx.font = '9px monospace';
            for (var ei = 0; ei < entries.length; ei++) {
                var ey = 38 + ei * 22, e = entries[ei];
                ctx.fillStyle = 'rgba(0, 255, 65, 0.05)';
                ctx.fillRect(8, ey + 3, W - 16, 10);
                ctx.fillStyle = 'rgba(0, 255, 65, ' + (ei === 0 ? 0.6 + Math.sin(t * 3) * 0.2 : 0.3) + ')';
                ctx.fillRect(8, ey + 3, (W - 16) * e.s / 100, 10);
                ctx.fillStyle = 'rgba(0, 255, 65, 0.7)';
                ctx.fillText(e.l, 10, ey);
                ctx.fillText(e.s + '%', W - 32, ey);
            }
            var blink = Math.floor(t * 2) % 2 === 0 ? '>' : ' ';
            ctx.fillStyle = 'rgba(0, 255, 65, 0.4)';
            ctx.font = '8px monospace';
            ctx.fillText(blink + ' SCANNING... ' + Math.floor((t * 7) % 100) + ' ROLES', 10, H - 10);
        }
        // Scanlines on panel
        for (var sly = 0; sly < H; sly += 4) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
            ctx.fillRect(0, sly, W, 2);
        }
    }

    var panelConfigs = [
        { x: -2.0, y: 1.6, z: -0.6, ry: 0.55, rx: -0.05, sw: 1.3, sh: 0.9, type: 0 },
        { x: 2.1, y: 1.3, z: -0.3, ry: -0.5, rx: 0.04, sw: 1.1, sh: 0.75, type: 1 },
        { x: 0.0, y: 2.35, z: -0.9, ry: 0.0, rx: 0.45, sw: 1.4, sh: 0.7, type: 2 },
    ];
    panelConfigs.forEach(function(cfg) {
        var W = 256, H = 192;
        var pCanvas = document.createElement('canvas');
        pCanvas.width = W; pCanvas.height = H;
        var pCtx = pCanvas.getContext('2d');
        var pTex = new THREE.CanvasTexture(pCanvas);
        pTex.minFilter = THREE.LinearFilter;
        var panelMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(cfg.sw, cfg.sh),
            new THREE.MeshBasicMaterial({ map: pTex, transparent: true, opacity: 0.75, side: THREE.DoubleSide })
        );
        var borderMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(cfg.sw + 0.02, cfg.sh + 0.02),
            wireMat(0.35)
        );
        borderMesh.position.z = -0.001;
        var group = new THREE.Group();
        group.add(panelMesh);
        group.add(borderMesh);
        group.position.set(cfg.x, cfg.y, cfg.z);
        group.rotation.y = cfg.ry;
        group.rotation.x = cfg.rx;
        scene.add(group);
        holoPanels.push({ group: group, ctx: pCtx, tex: pTex, type: cfg.type, baseY: cfg.y, baseRY: cfg.ry, W: W, H: H, mat: panelMesh.material });
    });

    function updateHoloPanels(t) {
        holoPanels.forEach(function(p, i) {
            p.group.position.y = p.baseY + Math.sin(t * 0.6 + i * 1.8) * 0.05;
            p.group.rotation.y = p.baseRY + Math.sin(t * 0.35 + i * 2.5) * 0.03;
            if (Math.floor(t * 30 + i * 7) % 3 === 0) {
                drawHoloPanel(p.ctx, p.W, p.H, t, p.type);
                p.tex.needsUpdate = true;
            }
        });
    }

    // ============================================================
    //  ORBITING WIREFRAME RINGS
    // ============================================================
    var orbitRings = [];
    var orbitConfigs = [
        { geo: new THREE.TorusGeometry(0.38, 0.012, 8, 48), opacity: 0.45, offset: new THREE.Vector3(0, 0, 1.8), center: new THREE.Vector3(0, 1.3, -0.2), speed: 0.22, tiltX: 0.4, tiltZ: 0.2 },
        { geo: new THREE.TorusKnotGeometry(0.22, 0.008, 64, 6, 2, 3), opacity: 0.3, offset: new THREE.Vector3(2.2, 0, 0), center: new THREE.Vector3(0, 1.4, -0.1), speed: 0.14, tiltX: 0.1, tiltZ: 0.55 },
        { geo: new THREE.TorusGeometry(0.28, 0.009, 6, 36), opacity: 0.35, offset: new THREE.Vector3(0, 1.5, 0), center: new THREE.Vector3(0, 1.26, -0.25), speed: 0.38, tiltX: 0.7, tiltZ: 0.1 },
    ];
    orbitConfigs.forEach(function(cfg, idx) {
        var mat = wireMat(cfg.opacity);
        var mesh = new THREE.Mesh(cfg.geo, mat);
        mesh.position.copy(cfg.offset);
        var pivot = new THREE.Group();
        pivot.rotation.x = cfg.tiltX;
        pivot.rotation.z = cfg.tiltZ;
        pivot.add(mesh);
        var outer = new THREE.Group();
        outer.position.copy(cfg.center);
        outer.add(pivot);
        scene.add(outer);
        orbitRings.push({ pivot: pivot, mesh: mesh, mat: mat, cfg: cfg, selfRot: 0.5 + idx * 0.3 });
    });

    function updateOrbitRings(t) {
        orbitRings.forEach(function(ring, i) {
            ring.pivot.rotation.y = t * ring.cfg.speed;
            ring.mesh.rotation.x = t * ring.selfRot * 0.4;
            ring.mesh.rotation.y = t * ring.selfRot * 0.6;
            ring.mat.opacity = ring.cfg.opacity * (0.7 + Math.sin(t * (1.1 + i * 0.4)) * 0.3);
        });
    }

    // ============================================================
    //  ENERGY PULSE RINGS (sonar from monitor)
    // ============================================================
    var pulsePool = [];
    var PULSE_POOL_SIZE = 5;
    for (var pi = 0; pi < PULSE_POOL_SIZE; pi++) {
        var pGeo = new THREE.TorusGeometry(1.0, 0.008, 4, 64);
        var pMat = solidMat(0, GREEN);
        pMat.side = THREE.DoubleSide;
        var pMesh = new THREE.Mesh(pGeo, pMat);
        pMesh.visible = false;
        scene.add(pMesh);
        pulsePool.push({ mesh: pMesh, mat: pMat, active: false });
    }
    var nextPulseTime = 2.0;

    function updatePulses(t) {
        if (t > nextPulseTime) {
            // Spawn
            for (var pi = 0; pi < PULSE_POOL_SIZE; pi++) {
                if (!pulsePool[pi].active) {
                    var s = pulsePool[pi];
                    s.mesh.position.set(0, 1.26, -0.2);
                    var v = Math.floor(Math.random() * 3);
                    if (v === 0) s.mesh.rotation.set(Math.PI / 2, 0, 0);
                    else if (v === 1) s.mesh.rotation.set(Math.PI / 2 - 0.6, 0, Math.random() * Math.PI);
                    else s.mesh.rotation.set(0, 0, 0);
                    s.mesh.scale.setScalar(0.05);
                    s.mesh.visible = true;
                    s.active = true;
                    s.birth = t;
                    s.dur = 2.5 + Math.random();
                    s.maxScale = 2 + Math.random() * 1.5;
                    s.peak = 0.3 + Math.random() * 0.2;
                    break;
                }
            }
            nextPulseTime = t + 1.5 + Math.random() * 2;
        }
        for (var pi = 0; pi < PULSE_POOL_SIZE; pi++) {
            var s = pulsePool[pi];
            if (!s.active) continue;
            var age = t - s.birth;
            var p = age / s.dur;
            if (p >= 1) { s.mat.opacity = 0; s.mesh.visible = false; s.active = false; continue; }
            s.mesh.scale.setScalar(0.05 + s.maxScale * p);
            s.mat.opacity = p < 0.15 ? (p / 0.15) * s.peak : s.peak * Math.pow(1 - (p - 0.15) / 0.85, 1.6);
        }
    }

    // ============================================================
    //  ATMOSPHERE — particles, glow, server rack
    // ============================================================
    var DUST_COUNT = 1500;
    var dustGeo = new THREE.BufferGeometry();
    var dustPos = new Float32Array(DUST_COUNT * 3);
    for (var di = 0; di < DUST_COUNT; di++) {
        dustPos[di * 3] = (Math.random() - 0.5) * 18;
        dustPos[di * 3 + 1] = Math.random() * 5.5;
        dustPos[di * 3 + 2] = (Math.random() - 0.5) * 18;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    var dustMat = new THREE.PointsMaterial({ color: GREEN, size: 0.025, transparent: true, opacity: 0.3, sizeAttenuation: true });
    var dustParticles = new THREE.Points(dustGeo, dustMat);
    scene.add(dustParticles);

    // Matrix rain
    var RAIN_COLS = 50, RAIN_PER_COL = 20, RAIN_COUNT = RAIN_COLS * RAIN_PER_COL;
    var rainGeo = new THREE.BufferGeometry();
    var rainPos = new Float32Array(RAIN_COUNT * 3);
    var rainSpeeds = new Float32Array(RAIN_COUNT);
    for (var rc = 0; rc < RAIN_COLS; rc++) {
        for (var rr = 0; rr < RAIN_PER_COL; rr++) {
            var ri = rc * RAIN_PER_COL + rr;
            rainPos[ri * 3] = (rc / RAIN_COLS - 0.5) * 16;
            rainPos[ri * 3 + 1] = Math.random() * 7;
            rainPos[ri * 3 + 2] = -3.2 + (Math.random() - 0.5) * 1.5;
            rainSpeeds[ri] = 0.3 + Math.random() * 1.2;
        }
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    var rainMat = new THREE.PointsMaterial({ color: GREEN, size: 0.055, transparent: true, opacity: 0.10, sizeAttenuation: true });
    var rainParticles = new THREE.Points(rainGeo, rainMat);
    scene.add(rainParticles);

    // Glow planes
    var glowPlane = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), solidMat(0.025, GREEN));
    glowPlane.position.set(0, 1.3, -0.5);
    scene.add(glowPlane);
    var deskGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.8), solidMat(0.04, GREEN));
    deskGlow.rotation.x = -Math.PI / 2;
    deskGlow.position.set(0, 0.80, 0.05);
    scene.add(deskGlow);
    var faceGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.5), solidMat(0.03, GREEN));
    faceGlow.position.set(0, 1.5, 1.1);
    scene.add(faceGlow);

    // Scan lines
    var scanLines = [];
    for (var sli = 0; sli < 4; sli++) {
        var sl = new THREE.Mesh(new THREE.PlaneGeometry(6, 0.015), solidMat(0.06, GREEN));
        sl.position.set(0, 0.5 + sli * 0.7, 0);
        sl.material.side = THREE.DoubleSide;
        scene.add(sl);
        scanLines.push(sl);
    }

    // Light beam from monitor
    var beamGeo = new THREE.ConeGeometry(2.5, 5, 4, 1, true);
    var beamMat = solidMat(0.012, GREEN);
    beamMat.side = THREE.DoubleSide;
    var beam = new THREE.Mesh(beamGeo, beamMat);
    beam.rotation.x = Math.PI / 2;
    beam.position.set(0, 1.2, 1.8);
    scene.add(beam);

    // Server rack
    var rackGroup = new THREE.Group();
    var rackFrame = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.8, 0.4), wireMat(0.12));
    rackFrame.position.set(0, 0.9, 0);
    rackGroup.add(rackFrame);
    for (var ru = 0; ru < 8; ru++) {
        var unit = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.04, 0.35), wireMat(0.08));
        unit.position.set(0, 0.2 + ru * 0.2, 0);
        rackGroup.add(unit);
    }
    var leds = [];
    for (var li = 0; li < 8; li++) {
        var led = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.01), solidMat(0.6, GREEN));
        led.position.set(-0.18, 0.2 + li * 0.2, 0.2);
        rackGroup.add(led);
        leds.push(led);
    }
    rackGroup.position.set(-3.5, 0, -2.5);
    rackGroup.rotation.y = 0.3;
    scene.add(rackGroup);

    // Floor reflection of monitor glow
    var floorReflect = new THREE.Mesh(
        new THREE.PlaneGeometry(2.5, 3),
        solidMat(0.02, GREEN)
    );
    floorReflect.rotation.x = -Math.PI / 2;
    floorReflect.position.set(0, 0.005, 0.5);
    scene.add(floorReflect);

    // ============================================================
    //  ANIMATION STATE
    // ============================================================
    var phase = 'idle';
    var warpStart = 0;
    var WARP_DURATION = 5500;
    var animId = null;

    // Dynamic camera paths — built when warp triggers
    var warpCamCurve = null;
    var warpLookCurve = null;

    // ============================================================
    //  IDLE CAMERA — cinematic orbiting establishing shot
    // ============================================================
    var _idleAngle = Math.PI * 0.5;

    function idleCameraUpdate(t) {
        // Static camera — slight angle from the right
        camera.position.set(2.8, 2.4, 5.2);
        camera.lookAt(0, 1.1, 0);
    }

    // ============================================================
    //  IDLE FRAME — all idle animations
    // ============================================================
    function idleFrame(t) {
        idleCameraUpdate(t);

        // Character breathing — subtle body sway
        head.position.y = 1.56 + Math.sin(t * 1.8) * 0.008;
        head.rotation.y = Math.sin(t * 0.4) * 0.03; // Subtle head turn
        head.rotation.x = -0.08 + Math.sin(t * 0.6) * 0.02; // Looking at screen
        torso.position.y = 1.13 + Math.sin(t * 1.8) * 0.004;
        torso.rotation.z = Math.sin(t * 0.5) * 0.008; // Subtle body sway

        // Typing hands — more dynamic, alternating keypresses
        var typingSpeed = 7;
        leftHand.position.y = 0.81 + Math.sin(t * typingSpeed) * 0.006;
        rightHand.position.y = 0.81 + Math.sin(t * typingSpeed + 1.8) * 0.006;
        leftHand.position.x = -0.15 + Math.sin(t * 5.5) * 0.015;
        rightHand.position.x = 0.15 + Math.sin(t * 5.5 + 2.5) * 0.015;
        // Forearm micro-movement with hands
        leftForearm.rotation.z = 0.15 + Math.sin(t * typingSpeed) * 0.02;
        rightForearm.rotation.z = -0.15 + Math.sin(t * typingSpeed + 1.8) * 0.02;

        // Eye glow pulse
        eyeMat.opacity = 0.5 + Math.sin(t * 2) * 0.2;

        // Keyboard key animation — random keys press down as character types
        var activeKey = Math.floor(Math.abs(Math.sin(t * typingSpeed * 0.7)) * 48) % 48;
        var activeKey2 = Math.floor(Math.abs(Math.cos(t * typingSpeed * 0.5 + 1)) * 48) % 48;
        for (var ki = 0; ki < keyMeshes.length; ki++) {
            var km = keyMeshes[ki];
            var pressed = (ki === activeKey || ki === activeKey2);
            var targetY = pressed ? km.userData.baseY - 0.006 : km.userData.baseY;
            km.position.y += (targetY - km.position.y) * 0.3; // Smooth interpolation
            km.material.opacity = pressed ? 0.25 : 0.12;
        }

        // PC Fan spinning
        var fanSpeed = t * 8;
        fanBlade1.rotation.z = fanSpeed;
        fanBlade2.rotation.z = fanSpeed + Math.PI / 2;
        fanBlade3.rotation.z = fanSpeed + Math.PI / 4;
        fanBlade4.rotation.z = fanSpeed - Math.PI / 4;

        // PC internal LEDs pulse
        pcLed1.material.opacity = 0.5 + Math.sin(t * 3) * 0.3;
        pcLed2.material.opacity = 0.3 + Math.sin(t * 1.5 + 1) * 0.2;
        pcGlow.material.opacity = 0.015 + Math.sin(t * 2) * 0.008;

        // LED desk underglow breathing
        var ledPulse = 0.06 + Math.sin(t * 1.2) * 0.025;
        ledStripMat.opacity = ledPulse;
        ledFloorGlow.material.opacity = ledPulse * 0.2;

        // Monitor brightness micro-pulse (screen flicker simulation)
        screenMesh.material.opacity = 0.93 + Math.sin(t * 4) * 0.02;

        // Speaker cone vibration
        spkConeL.scale.setScalar(1 + Math.sin(t * 12) * 0.05);
        spkConeR.scale.setScalar(1 + Math.sin(t * 12 + 0.5) * 0.05);

        // Second monitor update
        renderMon2(performance.now());

        // Dust drift
        var dPos = dustParticles.geometry.attributes.position.array;
        for (var i = 0; i < DUST_COUNT; i++) {
            dPos[i * 3 + 1] += Math.sin(t * 0.5 + i * 0.1) * 0.0002;
            dPos[i * 3] += Math.cos(t * 0.3 + i * 0.2) * 0.0001;
        }
        dustParticles.geometry.attributes.position.needsUpdate = true;

        // Matrix rain
        var rPos = rainParticles.geometry.attributes.position.array;
        for (var j = 0; j < RAIN_COUNT; j++) {
            rPos[j * 3 + 1] -= rainSpeeds[j] * 0.008;
            if (rPos[j * 3 + 1] < 0) rPos[j * 3 + 1] = 6.5 + Math.random();
        }
        rainParticles.geometry.attributes.position.needsUpdate = true;

        // Scan line sweep
        scanLines.forEach(function(sl, i) {
            sl.position.y = ((t * 0.3 + i * 0.25) % 3.5) + 0.2;
            sl.material.opacity = 0.04 + Math.sin(t + i) * 0.02;
        });

        // Server rack LED blink
        leds.forEach(function(led, i) {
            led.material.opacity = Math.sin(t * (2 + i * 0.5)) > 0.3 ? 0.6 : 0.05;
        });

        // Holographic panels, orbit rings, pulses
        updateHoloPanels(t);
        updateOrbitRings(t);
        updatePulses(t);
    }

    // ============================================================
    //  WARP — realistic "sit down at the desk" camera
    //  Camera approaches from orbit → behind character → settles
    //  into their seated POV looking at the monitor naturally.
    //  NO phasing through objects. The character fades out as the
    //  camera takes their place. Room stays visible but dims.
    // ============================================================
    function warpFrame(progress) {
        // Smooth ease-in-out
        var eased = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        // Camera follows the dynamically-built spline
        var camPos = warpCamCurve.getPointAt(Math.min(eased, 0.999));
        var lookPos = warpLookCurve.getPointAt(Math.min(eased, 0.999));
        camera.position.copy(camPos);
        camera.lookAt(lookPos);

        // FOV: starts at 50, gently narrows as we focus on the screen
        // Slight widening in middle for cinematic feel, then narrowing
        if (eased < 0.3) {
            camera.fov = 50 + eased * 8; // 50 → 52.4
        } else if (eased < 0.7) {
            camera.fov = 52.4 - (eased - 0.3) * 10; // 52.4 → 48.4
        } else {
            camera.fov = 48.4 - (eased - 0.7) * 22; // 48.4 → 41.8 (focused on screen)
        }
        camera.updateProjectionMatrix();

        // ---- Scene transitions ----

        // Character fades as camera approaches their position (eased 0.4-0.75)
        if (eased < 0.4) {
            charMaterial.opacity = 0.28;
        } else if (eased < 0.75) {
            charMaterial.opacity = 0.28 * (1 - (eased - 0.4) / 0.35);
        } else {
            charMaterial.opacity = 0;
        }
        // Eyes fade too
        if (eased > 0.35) {
            eyeMat.opacity = 0.7 * Math.max(0, 1 - (eased - 0.35) / 0.3);
        }

        // Room dims but stays visible (you're sitting IN the room)
        var roomDim = Math.max(0.02, 0.07 * (1 - eased * 0.7));
        roomMaterial.opacity = roomDim;

        // Desk stays visible longer (it's right in front of you)
        if (eased > 0.6) {
            var deskFade = Math.max(0.08, 1 - (eased - 0.6) / 0.4);
            deskMaterial.opacity = 0.35 * deskFade;
            accentMaterial.opacity = 0.22 * deskFade;
        }

        // Monitor frame fades as you focus purely on the screen
        monitorHousing.material.opacity = 0.4 * Math.max(0, 1 - eased * 1.2);

        // Screen brightens
        screenMesh.material.opacity = 0.95 + eased * 0.05;

        // Monitor glow intensifies (you're closer)
        glowPlane.material.opacity = 0.025 + eased * 0.04;
        deskGlow.material.opacity = 0.04 + eased * 0.03;
        faceGlow.material.opacity = 0.03 * (1 - eased); // face glow irrelevant now

        // Particles dim
        dustMat.opacity = 0.3 * Math.max(0, 1 - eased * 1.2);
        rainMat.opacity = 0.10 * Math.max(0, 1 - eased * 1.5);

        // Beam dims
        beamMat.opacity = 0.012 * Math.max(0, 1 - eased * 2);

        // Holo panels fade
        holoPanels.forEach(function(p) {
            p.mat.opacity = 0.75 * Math.max(0, 1 - eased * 1.8);
        });

        // Orbit rings fade
        orbitRings.forEach(function(ring) {
            ring.mat.opacity = ring.cfg.opacity * Math.max(0, 1 - eased * 2);
        });

        // Pulses fade
        pulsePool.forEach(function(s) {
            if (s.active) s.mat.opacity *= Math.max(0, 1 - eased * 2);
        });

        // Scan lines dim
        scanLines.forEach(function(sl) {
            sl.material.opacity = 0.04 * Math.max(0, 1 - eased * 2);
        });

        // Floor reflection brightens then fades
        floorReflect.material.opacity = eased < 0.5 ? 0.02 + eased * 0.04 : 0.04 * (1 - (eased - 0.5) * 2);

        // Subtle green tint in background as screen dominates
        if (eased > 0.6) {
            var tint = (eased - 0.6) / 0.4;
            renderer.setClearColor(new THREE.Color().lerpColors(
                new THREE.Color(0x000000),
                new THREE.Color(0x010a01),
                tint * 0.5
            ));
        }

        // Final fade
        if (eased > 0.85) {
            var finalT = (eased - 0.85) / 0.15;
            renderer.setClearColor(new THREE.Color().lerpColors(
                new THREE.Color(0x010a01),
                new THREE.Color(0x0a0a0a),
                Math.pow(finalT, 2)
            ));
            scene.fog.density = 0.04 + finalT * 0.08;
        }

        // Continue rain during warp
        var rPos = rainParticles.geometry.attributes.position.array;
        for (var j = 0; j < RAIN_COUNT; j++) {
            rPos[j * 3 + 1] -= rainSpeeds[j] * 0.008;
            if (rPos[j * 3 + 1] < 0) rPos[j * 3 + 1] = 6.5;
        }
        rainParticles.geometry.attributes.position.needsUpdate = true;

        // LEDs
        var now = performance.now() / 1000;
        leds.forEach(function(led, i) {
            led.material.opacity = Math.sin(now * (2 + i * 0.5)) > 0.3 ? 0.4 : 0.02;
        });

        // Glitch effect in the last 25%
        var glitchIntensity = 0;
        if (eased > 0.75) {
            glitchIntensity = Math.pow((eased - 0.75) / 0.25, 2);
        }
        GlitchFX.render(glitchIntensity);

        // Post-processing overlay
        PostFX.render(now, eased);

        // Hide title
        if (progress > 0.02) {
            introTitle.classList.add('hide');
            introHint.classList.add('hide');
        }

        // Trigger fadeout
        if (progress > 0.84 && !fadeout.classList.contains('active')) {
            fadeout.classList.add('active');
        }

        // Done
        if (progress >= 1) {
            phase = 'done';
            cancelAnimationFrame(animId);
            renderer.dispose();
            container.style.display = 'none';
            PostFX.destroy();
            GlitchFX.destroy();
            setTimeout(function() {
                fadeout.style.transition = 'opacity 0.6s ease';
                fadeout.style.opacity = '0';
                setTimeout(function() { fadeout.style.display = 'none'; }, 600);
                boot();
            }, 300);
        }
    }

    // ============================================================
    //  MAIN RENDER LOOP
    // ============================================================
    function animate(now) {
        animId = requestAnimationFrame(animate);
        var t = now / 1000;

        renderScreen(now);

        if (phase === 'idle') {
            idleFrame(t);
            // Post-FX during idle (subtle)
            PostFX.render(now, 0);
            GlitchFX.render(0);
        } else if (phase === 'warp') {
            var elapsed = now - warpStart;
            var progress = Math.min(elapsed / WARP_DURATION, 1);
            warpFrame(progress);
        }

        if (phase !== 'done') {
            renderer.render(scene, camera);
        }
    }

    animate(performance.now());

    // ============================================================
    //  CLICK — build dynamic camera path and start warp
    // ============================================================
    function onIntroClick() {
        if (phase !== 'idle') return;
        container.removeEventListener('click', onIntroClick);
        container.removeEventListener('touchstart', onIntroClick);

        initAudio();
        fadeInMusic();

        // Capture current camera position from orbit
        var startPos = camera.position.clone();

        // Build a realistic approach path:
        // from orbit → approach from behind → settle into character's seated POV
        // Character head: (0, 1.56, 1.15), seated eye level ~ (0, 1.48, 1.0)
        // Final position: leaned slightly forward, natural monitor viewing distance
        warpCamCurve = new THREE.CatmullRomCurve3([
            startPos,                                    // Where the orbit is now
            new THREE.Vector3(0.4, 2.0, 4.0),          // Swing toward the scene
            new THREE.Vector3(0.2, 1.65, 2.5),         // Approach from behind chair
            new THREE.Vector3(0.05, 1.52, 1.5),        // Getting close to character
            new THREE.Vector3(0, 1.48, 1.15),          // At character's head position
            new THREE.Vector3(0, 1.44, 0.85),          // Leaned forward — natural POV
        ], false, 'catmullrom', 0.4);

        warpLookCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 1.1, 0),              // Looking at desk (from orbit)
            new THREE.Vector3(0, 1.2, -0.1),           // Transitioning focus
            new THREE.Vector3(0, 1.26, -0.2),          // Zeroing in on monitor
            new THREE.Vector3(0, 1.26, -0.25),         // Dead center on screen
            new THREE.Vector3(0, 1.26, -0.25),         // Settled — looking at screen
            new THREE.Vector3(0, 1.26, -0.25),         // Final — natural gaze at monitor
        ], false, 'catmullrom', 0.4);

        phase = 'warp';
        warpStart = performance.now();
    }

    container.addEventListener('click', onIntroClick);
    container.addEventListener('touchstart', onIntroClick, { passive: true });

    // Resize
    window.addEventListener('resize', function() {
        if (phase === 'done') return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
})();
