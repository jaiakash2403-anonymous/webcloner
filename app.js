// Import * as THREE from CDN if needed, but since it is loaded in script tag globally, we access it via window.THREE
const THREE = window.THREE;

// Application State
const state = {
    currentView: 'landing', // 'landing' or 'dashboard'
    theme: 'theme-cyber-blue',
    url: '',
    authorized: false,
    progress: 0, // 0 to 100
    isPlaying: false,
    speed: 1, // 1, 1.5, 2
    timerId: null,
    lastTickTime: null,
    
    // Nodes for Web Graph
    graphNodes: [
        { id: 'Home', x: 250, y: 180, r: 24, label: 'Home Page', isCrawled: false, status: 'root' },
        { id: 'About', x: 120, y: 300, r: 18, label: 'About Us', isCrawled: false, status: 'child' },
        { id: 'Contact', x: 380, y: 300, r: 18, label: 'Contact Panel', isCrawled: false, status: 'child' },
        { id: 'Pricing', x: 250, y: 340, r: 18, label: 'Pricing Plan', isCrawled: false, status: 'child' },
        { id: 'Dashboard', x: 250, y: 460, r: 20, label: 'Client Dashboard', isCrawled: false, status: 'grandchild' }
    ],
    graphLinks: [
        { source: 'Home', target: 'About' },
        { source: 'Home', target: 'Contact' },
        { source: 'Home', target: 'Pricing' },
        { source: 'Pricing', target: 'Dashboard' }
    ],
    graphPulses: [], // dynamic visual particles traversing links
    draggedNodeIndex: -1,
    zoomScale: 1,
    zoomOffset: { x: 0, y: 0 },

    // Asset Galaxy planetary bodies
    galaxyAssets: [
        { id: 'index.html', type: 'html', size: '12.4 KB', optimized: 'Optimized (Gzipped)', score: '98%', fileCount: 1, angle: 0, radius: 80, speed: 0.02, sizeVal: 12 },
        { id: 'style.css', type: 'css', size: '42.1 KB', optimized: 'Compressed & Bundled', score: '95%', fileCount: 1, angle: 1.2, radius: 120, speed: 0.015, sizeVal: 15 },
        { id: 'animations.css', type: 'css', size: '15.3 KB', optimized: 'Minified', score: '100%', fileCount: 1, angle: 3.5, radius: 140, speed: 0.012, sizeVal: 10 },
        { id: 'app.js', type: 'js', size: '105.8 KB', optimized: 'Tree-shaken & Minified', score: '91%', fileCount: 1, angle: 2.1, radius: 180, speed: 0.01, sizeVal: 22 },
        { id: 'logo.svg', type: 'image', size: '2.8 KB', optimized: 'SVGO Stripped', score: '100%', fileCount: 1, angle: 4.8, radius: 210, speed: 0.008, sizeVal: 8 },
        { id: 'hero-mesh.jpg', type: 'image', size: '240.5 KB', optimized: 'WebP Compressed', score: '88%', fileCount: 1, angle: 0.8, radius: 230, speed: 0.007, sizeVal: 25 },
        { id: 'orbitron.woff2', type: 'font', size: '18.2 KB', optimized: 'Embedded Subsets', score: '100%', fileCount: 1, angle: 5.6, radius: 260, speed: 0.005, sizeVal: 9 }
    ],
    hoveredAsset: null,

    // AI chat logs
    chatLogs: [
        { sender: 'assistant', text: 'Greetings! I am the WebCloner AI agent. Feed me questions like "Where is the CSS style loaded?" or "How can I download this code?". How can I assist your site replication process?' }
    ]
};

// Theme configurations for background colors & Three materials
const THEME_PARAMS = {
    'theme-cyber-blue': { primary: 0x00f0ff, accent: 0x7000ff, highlight: 0x00ffaa, bg: 0x060913 },
    'theme-neon-purple': { primary: 0xf000ff, accent: 0x00ffff, highlight: 0xff007f, bg: 0x0a0518 },
    'theme-emerald-matrix': { primary: 0x00ff66, accent: 0x007f3f, highlight: 0xadff2f, bg: 0x020804 },
    'theme-synthwave': { primary: 0xff5e62, accent: 0xff9966, highlight: 0xfbb03b, bg: 0x14051a },
    'theme-aurora': { primary: 0x00f5d4, accent: 0x00bbf9, highlight: 0x70e000, bg: 0x050e12 },
    'theme-midnight-glass': { primary: 0xffffff, accent: 0x44444c, highlight: 0xa1a1a6, bg: 0x0a0a0c }
};

// Global variables for Three.js renderers
let bgScene, bgCamera, bgRenderer, bgParticles, bgLines;
let coreScene, coreCamera, coreRenderer, coreSphere, coreOrbitals;

// DOM Elements cache
let dom = {};

document.addEventListener('DOMContentLoaded', () => {
    cacheDomElements();
    initIcons();
    initThreeBackground();
    initThemeSelector();
    bindEvents();
    setupCanvasVisualizers();
});

function cacheDomElements() {
    dom = {
        body: document.body,
        themeBtn: document.getElementById('theme-btn'),
        activeThemeName: document.getElementById('active-theme-name'),
        themeDropdown: document.getElementById('theme-dropdown'),
        resetBtn: document.getElementById('reset-btn'),
        siteIndicator: document.getElementById('site-indicator'),
        indicatorUrlText: document.getElementById('indicator-url-text'),
        
        landingView: document.getElementById('landing-view'),
        dashboardView: document.getElementById('dashboard-view'),
        
        targetUrl: document.getElementById('target-url'),
        startScanBtn: document.getElementById('start-scan-btn'),
        authCheckbox: document.getElementById('auth-checkbox'),
        permissionContainer: document.getElementById('permission-container'),
        urlLaser: document.getElementById('url-laser'),
        
        telemetryPercentage: document.getElementById('telemetry-percentage'),
        progressCircle: document.getElementById('progress-circle'),
        telemetryKbps: document.getElementById('telemetry-kbps'),
        scannerStateText: document.getElementById('scanner-state-text'),
        
        vizTabs: document.querySelectorAll('.viz-tab'),
        vizContents: document.querySelectorAll('.viz-content'),
        
        // Checklist steps
        stepHtml: document.getElementById('step-html'),
        stepCss: document.getElementById('step-css'),
        stepJs: document.getElementById('step-js'),
        stepImages: document.getElementById('step-images'),
        stepFonts: document.getElementById('step-fonts'),
        stepAssets: document.getElementById('step-assets'),
        
        // Folders
        folderHtml: document.getElementById('folder-html'),
        folderCss: document.getElementById('folder-css'),
        folderJs: document.getElementById('folder-js'),
        folderAssets: document.getElementById('folder-assets'),
        
        // Tree Files
        fileHtml: document.getElementById('file-html'),
        fileStyleCss: document.getElementById('file-style-css'),
        fileAnimationCss: document.getElementById('file-animation-css'),
        fileAppJs: document.getElementById('file-app-js'),
        fileLogo: document.getElementById('file-logo'),
        fileBg: document.getElementById('file-bg'),
        
        // Compress / ZIP Log Console
        packagingCube: document.getElementById('packaging-cube'),
        compresConsoleLog: document.getElementById('compres-console-log'),
        zipDownloadBtn: document.getElementById('zip-download-btn'),
        
        // Split preview browser
        diffBtn: document.getElementById('diff-btn'),
        diffOverlay: document.getElementById('diff-code-overlay'),
        browserOriginal: document.getElementById('browser-original'),
        browserReplica: document.getElementById('browser-replica'),
        iframeOrig: document.getElementById('iframe-orig'),
        iframeRepl: document.getElementById('iframe-repl'),
        
        // Replay timeline
        replayController: document.getElementById('replay-controller'),
        replayPlayBtn: document.getElementById('replay-play-btn'),
        playBtnIcon: document.getElementById('play-btn-icon'),
        replayPrevBtn: document.getElementById('replay-prev-btn'),
        replayNextBtn: document.getElementById('replay-next-btn'),
        replaySpeedBtn: document.getElementById('replay-speed-btn'),
        speedLabel: document.getElementById('speed-label'),
        timelineScrubBar: document.getElementById('timeline-scrub-bar'),
        timelineProgressFill: document.getElementById('timeline-progress-fill'),
        timelineHandle: document.getElementById('timeline-handle'),
        timelineTime: document.getElementById('timeline-time'),
        timelinePhaseText: document.getElementById('timeline-phase-text'),
        timelineNodes: document.querySelectorAll('.timeline-node'),
        
        // AI Assistant Orb
        aiOrbBtn: document.getElementById('ai-orb-btn'),
        aiChatConsole: document.getElementById('ai-chat-console'),
        chatCloseBtn: document.getElementById('chat-close-btn'),
        chatMessagesContainer: document.getElementById('chat-messages-container'),
        chatInput: document.getElementById('chat-input'),
        chatSendBtn: document.getElementById('chat-send-btn'),
        chatChips: document.querySelectorAll('.chat-suggest-chip')
    };
}

function initIcons() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// ----------------------------------------------------
// THREE.JS: Neural Network Background
// ----------------------------------------------------
function initThreeBackground() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    bgScene = new THREE.Scene();
    bgScene.fog = new THREE.FogExp2(0x060913, 0.0015);

    bgCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    bgCamera.position.z = 250;

    bgRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    bgRenderer.setPixelRatio(window.devicePixelRatio);
    bgRenderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(bgRenderer.domElement);

    // Build neural particles geometry
    const particleCount = 180;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
        // distribute inside a sphere
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = Math.random() * 300 + 50;

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        velocities.push({
            x: (Math.random() - 0.5) * 0.2,
            y: (Math.random() - 0.5) * 0.2,
            z: (Math.random() - 0.5) * 0.2
        });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Particle texture
    const currentThemeParams = THEME_PARAMS[state.theme];
    const particleMaterial = new THREE.PointsMaterial({
        color: currentThemeParams.primary,
        size: 2.2,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
    });

    bgParticles = new THREE.Points(geometry, particleMaterial);
    bgScene.add(bgParticles);

    // Connections lines
    const lineMaterial = new THREE.LineBasicMaterial({
        color: currentThemeParams.accent,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending
    });

    // We build indices dynamically in update loop to draw connecting lines between close points
    bgLines = new THREE.LineSegments(new THREE.BufferGeometry(), lineMaterial);
    bgScene.add(bgLines);

    // Decorative floating browser screens in background
    createFloatingBackgroundTabs();

    window.addEventListener('resize', onWindowResize);
    animateBackground();
}

function onWindowResize() {
    bgCamera.aspect = window.innerWidth / window.innerHeight;
    bgCamera.updateProjectionMatrix();
    bgRenderer.setSize(window.innerWidth, window.innerHeight);

    if (coreRenderer && dom.coreCanvas) {
        const rect = dom.coreCanvas.getBoundingClientRect();
        coreCamera.aspect = rect.width / rect.height;
        coreCamera.updateProjectionMatrix();
        coreRenderer.setSize(rect.width, rect.height);
    }
}

function animateBackground() {
    requestAnimationFrame(animateBackground);

    // Rotate the overall particle system
    bgParticles.rotation.y += 0.0003;
    bgParticles.rotation.x += 0.0001;

    const positions = bgParticles.geometry.attributes.position.array;
    const vertexCount = positions.length / 3;

    // Slowly drift particles and update positions
    for (let i = 0; i < vertexCount; i++) {
        // add drift
        positions[i * 3] += (Math.sin(Date.now() * 0.001 + i) * 0.02);
        positions[i * 3 + 1] += (Math.cos(Date.now() * 0.0007 + i) * 0.02);
        positions[i * 3 + 2] += (Math.sin(Date.now() * 0.0005 + i) * 0.02);
    }
    bgParticles.geometry.attributes.position.needsUpdate = true;

    // Draw connection lines for particles that are close
    const linePositions = [];
    const maxDistance = 70;

    for (let i = 0; i < vertexCount; i++) {
        const x1 = positions[i * 3];
        const y1 = positions[i * 3 + 1];
        const z1 = positions[i * 3 + 2];

        for (let j = i + 1; j < vertexCount; j++) {
            const x2 = positions[j * 3];
            const y2 = positions[j * 3 + 1];
            const z2 = positions[j * 3 + 2];

            const dx = x1 - x2;
            const dy = y1 - y2;
            const dz = z1 - z2;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < maxDistance) {
                linePositions.push(x1, y1, z1);
                linePositions.push(x2, y2, z2);
            }
        }
    }

    bgLines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    bgLines.geometry.computeBoundingSphere();
    bgLines.geometry.attributes.position.needsUpdate = true;

    bgRenderer.render(bgScene, bgCamera);
}

function updateThreeThemeColors() {
    const currentThemeParams = THEME_PARAMS[state.theme];
    bgScene.fog.color.setHex(currentThemeParams.bg);

    if (bgParticles) {
        bgParticles.material.color.setHex(currentThemeParams.primary);
    }
    if (bgLines) {
        bgLines.material.color.setHex(currentThemeParams.accent);
    }

    if (coreSphere) {
        coreSphere.material.color.setHex(currentThemeParams.primary);
        coreSphere.material.emissive.setHex(currentThemeParams.accent);
    }
    if (coreOrbitals) {
        coreOrbitals.material.color.setHex(currentThemeParams.highlight);
    }
}

// ----------------------------------------------------
// THREE.JS: Holographic AI Core Sphere
// ----------------------------------------------------
function initThreeAICore() {
    dom.coreCanvas = document.getElementById('core-globe-canvas');
    if (!dom.coreCanvas) return;

    const rect = dom.coreCanvas.getBoundingClientRect();

    coreScene = new THREE.Scene();
    coreCamera = new THREE.PerspectiveCamera(45, rect.width / rect.height, 0.1, 100);
    coreCamera.position.z = 28;

    coreRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    coreRenderer.setSize(rect.width, rect.height);
    coreRenderer.setPixelRatio(window.devicePixelRatio);
    dom.coreCanvas.appendChild(coreRenderer.domElement);

    // Glowing Sphere
    const geom = new THREE.SphereGeometry(6, 32, 32);
    const themeColors = THEME_PARAMS[state.theme];
    
    const mat = new THREE.MeshPhongMaterial({
        color: themeColors.primary,
        emissive: themeColors.accent,
        wireframe: true,
        transparent: true,
        opacity: 0.6,
        shininess: 100
    });

    coreSphere = new THREE.Mesh(geom, mat);
    coreScene.add(coreSphere);

    // Add ambient and point light to scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    coreScene.add(ambientLight);

    const pointLight = new THREE.PointLight(themeColors.primary, 2, 50);
    pointLight.position.set(10, 10, 10);
    coreScene.add(pointLight);

    // Orbiting particle ring
    const particleCount = 120;
    const ringGeom = new THREE.BufferGeometry();
    const ringPos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        const radius = 9 + Math.random() * 2;
        const theta = (i / particleCount) * Math.PI * 2;

        ringPos[i * 3] = radius * Math.cos(theta);
        ringPos[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
        ringPos[i * 3 + 2] = radius * Math.sin(theta);
    }

    ringGeom.setAttribute('position', new THREE.BufferAttribute(ringPos, 3));

    const ringMat = new THREE.PointsMaterial({
        color: themeColors.highlight,
        size: 0.4,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    coreOrbitals = new THREE.Points(ringGeom, ringMat);
    coreScene.add(coreOrbitals);

    animateCore();
}

function animateCore() {
    if (!coreScene || !coreRenderer) return;
    requestAnimationFrame(animateCore);

    // Speed of rotation depends on current state progress
    const progressSpeedMultiplier = 1 + (state.progress / 35);
    const activeMultiplier = state.isPlaying ? state.speed : 0.5;
    
    coreSphere.rotation.y += 0.008 * progressSpeedMultiplier * activeMultiplier;
    coreSphere.rotation.x += 0.003 * progressSpeedMultiplier * activeMultiplier;

    coreOrbitals.rotation.y -= 0.004 * progressSpeedMultiplier * activeMultiplier;

    // Pulse size slightly matching progress
    const pulseFactor = 1 + Math.sin(Date.now() * 0.002) * (0.04 + (state.progress / 2000));
    coreSphere.scale.set(pulseFactor, pulseFactor, pulseFactor);

    coreRenderer.render(coreScene, coreCamera);
}

// Create slow floating tabs in background for rich visual depth
function createFloatingBackgroundTabs() {
    const parent = dom.floatingTabs;
    if (!parent) return;
    parent.innerHTML = '';

    const tabsData = [
        { text: 'style.css', top: 15, left: 10, speed: 0.03 },
        { text: 'index.html', top: 40, left: 80, speed: 0.02 },
        { text: 'main.js', top: 75, left: 20, speed: 0.04 },
        { text: 'logo.svg', top: 60, left: 70, speed: 0.015 },
        { text: 'fonts.css', top: 25, left: 45, speed: 0.025 }
    ];

    tabsData.forEach(data => {
        const el = document.createElement('div');
        el.className = 'floating-tab-dec';
        el.innerText = data.text;
        el.style.top = `${data.top}%`;
        el.style.left = `${data.left}%`;
        
        let positionY = 0;
        let dir = 1;

        // Simple float animation in interval
        setInterval(() => {
            positionY += 0.3 * dir;
            if (Math.abs(positionY) > 20) {
                dir *= -1;
            }
            el.style.transform = `translateY(${positionY}px) rotate(${positionY * 0.2}deg)`;
        }, 60);

        parent.appendChild(el);
    });
}

// ----------------------------------------------------
// THEME SWITCHER
// ----------------------------------------------------
function initThemeSelector() {
    dom.themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dom.themeDropdown.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        dom.themeDropdown.classList.remove('show');
    });

    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            const chosenTheme = opt.getAttribute('data-theme');
            
            // Remove old theme classes
            Object.keys(THEME_PARAMS).forEach(t => dom.body.classList.remove(t));
            
            // Set new theme
            dom.body.classList.add(chosenTheme);
            state.theme = chosenTheme;
            dom.activeThemeName.innerText = opt.innerText.trim();
            
            // Mark active option
            themeOptions.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');

            // Refresh WebGL Colors
            updateThreeThemeColors();
        });
    });
}

// ----------------------------------------------------
// INPUT & WORKSPACE ROUTING
// ----------------------------------------------------
function bindEvents() {
    dom.startScanBtn.addEventListener('click', handleStartScan);
    dom.targetUrl.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleStartScan();
    });

    dom.resetBtn.addEventListener('click', handleResetWorkspace);

    // Tab switching in dashboard
    dom.vizTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            dom.vizTabs.forEach(t => t.classList.remove('active'));
            dom.vizContents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            const targetContent = document.getElementById(tabId);
            if (targetContent) targetContent.classList.add('active');
        });
    });

    // Morphing / 3D tilt mouse movement on showcase cards
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const px = (x / rect.width) * 2 - 1; // -1 to 1
            const py = (y / rect.height) * 2 - 1; // -1 to 1
            
            card.style.transform = `perspective(800px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-4px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(800px) rotateY(0deg) rotateX(0deg) translateY(0)`;
        });
    });

    // 3D Browser mouse movement perspective tilt
    const browserPanels = [dom.browserOriginal, dom.browserReplica];
    browserPanels.forEach(panel => {
        if (!panel) return;
        panel.addEventListener('mousemove', (e) => {
            const rect = panel.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const px = (x / rect.width) * 2 - 1;
            const py = (y / rect.height) * 2 - 1;
            
            panel.style.transform = `perspective(1000px) rotateY(${px * 4}deg) rotateX(${-py * 4}deg)`;
        });
        panel.addEventListener('mouseleave', () => {
            panel.style.transform = `perspective(1000px) rotateY(0) rotateX(0)`;
        });
    });

    // Split Scroll simulation synchronization
    if (dom.iframeOrig && dom.iframeRepl) {
        dom.iframeOrig.addEventListener('scroll', () => {
            dom.iframeRepl.scrollTop = dom.iframeOrig.scrollTop;
        });
        dom.iframeRepl.addEventListener('scroll', () => {
            dom.iframeOrig.scrollTop = dom.iframeRepl.scrollTop;
        });
    }

    // Code comparison difference overlay toggling
    dom.diffBtn.addEventListener('click', () => {
        const isHidden = dom.diffOverlay.style.display === 'none';
        dom.diffOverlay.style.display = isHidden ? 'block' : 'none';
        dom.diffBtn.classList.toggle('active', isHidden);
    });

    // Folders collapse in Explorer Tree
    const treeFolders = document.querySelectorAll('.tree-folder > .tree-item');
    treeFolders.forEach(folderItem => {
        folderItem.addEventListener('click', () => {
            folderItem.parentElement.classList.toggle('collapsed');
        });
    });

    // Replay Player controls
    dom.replayPlayBtn.addEventListener('click', toggleReplayPlayback);
    dom.replayPrevBtn.addEventListener('click', stepTimelineBackward);
    dom.replayNextBtn.addEventListener('click', stepTimelineForward);
    dom.replaySpeedBtn.addEventListener('click', changeReplaySpeed);
    
    // Timeline scrubber drag/click
    dom.timelineScrubBar.addEventListener('mousedown', handleTimelineScrubStart);

    // AI Assistant Orb
    dom.aiOrbBtn.addEventListener('click', () => {
        dom.aiChatConsole.style.display = dom.aiChatConsole.style.display === 'none' ? 'flex' : 'none';
        scrollToBottomChat();
    });
    dom.chatCloseBtn.addEventListener('click', () => {
        dom.aiChatConsole.style.display = 'none';
    });
    dom.chatSendBtn.addEventListener('click', handleUserSendMessage);
    dom.chatInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleUserSendMessage();
    });

    dom.chatChips.forEach(chip => {
        chip.addEventListener('click', () => {
            dom.chatInput.value = chip.getAttribute('data-text');
            handleUserSendMessage();
        });
    });

    // Zip Export trigger download
    dom.zipDownloadBtn.addEventListener('click', generateProjectZIP);
}

function handleStartScan() {
    const url = dom.targetUrl.value.trim();
    if (!url) {
        alert('Please enter a valid website URL.');
        return;
    }
    
    // Pro confirm checks
    if (!dom.authCheckbox.checked) {
        dom.permissionContainer.classList.add('pulse');
        setTimeout(() => dom.permissionContainer.classList.remove('pulse'), 1500);
        alert('You must confirm authorization permissions to crawl this website domain.');
        return;
    }

    state.url = url;
    state.authorized = true;
    
    // Run laser scan line animation
    dom.urlLaser.classList.add('scanning');
    dom.startScanBtn.innerText = 'Scanning...';
    dom.startScanBtn.disabled = true;

    // Laser sweeps for 2.2 seconds before transitioning to workspace
    setTimeout(() => {
        dom.urlLaser.classList.remove('scanning');
        
        // Show indicator details
        dom.indicatorUrlText.innerText = state.url;
        dom.siteIndicator.style.display = 'flex';
        dom.resetBtn.style.display = 'flex';

        // Swap View Layout
        dom.landingView.classList.remove('active');
        dom.dashboardView.classList.add('active');
        dom.replayController.style.display = 'flex';

        state.currentView = 'dashboard';
        
        // Init 3D AI globe canvas
        if (!coreScene) {
            initThreeAICore();
        }

        // Auto play the timeline crawl
        startReplayPlayback();
    }, 2200);
}

function handleResetWorkspace() {
    stopReplayPlayback();
    state.progress = 0;
    state.isPlaying = false;
    updateTimelineUI();
    updateReconstructedStateElements();

    dom.siteIndicator.style.display = 'none';
    dom.resetBtn.style.display = 'none';
    dom.landingView.classList.add('active');
    dom.dashboardView.classList.remove('active');
    dom.replayController.style.display = 'none';
    
    dom.startScanBtn.innerHTML = '<span>Start Analysis</span><i data-lucide="arrow-right"></i>';
    dom.startScanBtn.disabled = false;
    initIcons();

    // Reset download console
    dom.zipDownloadBtn.disabled = true;
    dom.zipDownloadBtn.querySelector('span').innerText = 'AI Package Generator';
    dom.packagingCube.classList.remove('folded', 'compressing');
    dom.compresConsoleLog.innerHTML = '<div class="log-line">System ready...</div>';
}

// ----------------------------------------------------
// TIMELINE REPLAY LOGIC
// ----------------------------------------------------
function startReplayPlayback() {
    if (state.progress >= 100) {
        state.progress = 0;
    }
    state.isPlaying = true;
    state.lastTickTime = Date.now();
    dom.playBtnIcon.setAttribute('data-lucide', 'pause');
    initIcons();

    // Start tick loop
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = setInterval(onTimelineTick, 30);
}

function stopReplayPlayback() {
    state.isPlaying = false;
    dom.playBtnIcon.setAttribute('data-lucide', 'play');
    initIcons();
    if (state.timerId) {
        clearInterval(state.timerId);
        state.timerId = null;
    }
}

function toggleReplayPlayback() {
    if (state.isPlaying) {
        stopReplayPlayback();
    } else {
        startReplayPlayback();
    }
}

function changeReplaySpeed() {
    if (state.speed === 1) {
        state.speed = 1.5;
    } else if (state.speed === 1.5) {
        state.speed = 2.5;
    } else {
        state.speed = 1;
    }
    dom.speedLabel.innerText = `${state.speed.toFixed(1)}x`;
}

function onTimelineTick() {
    const now = Date.now();
    const delta = (now - state.lastTickTime) / 1000;
    state.lastTickTime = now;

    // Simulation takes approx 15 seconds at 1.0x speed
    const increment = (100 / 15) * delta * state.speed;
    state.progress += increment;

    if (state.progress >= 100) {
        state.progress = 100;
        stopReplayPlayback();
        triggerSuccessCelebration();
    }

    updateTimelineUI();
    updateReconstructedStateElements();
}

function updateTimelineUI() {
    // 1. Scrubber handle & fill bar
    dom.timelineProgressFill.style.width = `${state.progress}%`;
    dom.timelineHandle.style.left = `${state.progress}%`;

    // 2. Timestamp timer simulation
    const totalSeconds = (state.progress / 100) * 15;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const ms = Math.floor((totalSeconds % 1) * 100);
    dom.timelineTime.innerText = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;

    // 3. Telemetry numbers matching progress
    dom.telemetryPercentage.innerText = `${Math.floor(state.progress)}%`;

    // Circular progress SVG logic (stroke-dasharray is 440)
    const strokeOffset = 440 - (440 * state.progress) / 100;
    dom.progressCircle.style.strokeDashoffset = strokeOffset;

    // Kbps rate simulator
    const speedRates = [120, 240, 480, 850, 1024, 150, 0];
    const index = Math.floor((state.progress / 100) * (speedRates.length - 1));
    const rate = state.progress < 100 ? speedRates[index] + Math.floor(Math.random() * 50) : 0;
    dom.telemetryKbps.innerText = rate > 0 ? `${rate} KB/s` : 'Idle';

    // 4. Scrubber milestones activation highlights
    dom.timelineNodes.forEach(node => {
        const threshold = parseFloat(node.getAttribute('data-progress'));
        if (state.progress >= threshold) {
            node.classList.add('active');
            if (state.progress > threshold + 10) {
                node.classList.add('passed');
            } else {
                node.classList.remove('passed');
            }
        } else {
            node.classList.remove('active', 'passed');
        }
    });

    // 5. Update status text
    let phaseText = 'Initialization';
    if (state.progress > 0 && state.progress < 25) {
        phaseText = 'Phase 1: Scanning URL Node Trees';
    } else if (state.progress >= 25 && state.progress < 50) {
        phaseText = 'Phase 2: Extracting Assets & Script Links';
    } else if (state.progress >= 50 && state.progress < 75) {
        phaseText = 'Phase 3: AI Code Reconstruction';
    } else if (state.progress >= 75 && state.progress < 100) {
        phaseText = 'Phase 4: Optimization & Asset Validation';
    } else if (state.progress >= 100) {
        phaseText = 'Phase 5: Package Deploy Ready';
    }
    dom.timelinePhaseText.innerText = phaseText;
    dom.scannerStateText.innerText = state.progress < 100 ? 'Scanning...' : 'Complete';
}

function handleTimelineScrubStart(e) {
    e.preventDefault();
    document.addEventListener('mousemove', handleTimelineScrubMove);
    document.addEventListener('mouseup', handleTimelineScrubEnd);
    handleScrubToPosition(e);
}

function handleTimelineScrubMove(e) {
    handleScrubToPosition(e);
}

function handleTimelineScrubEnd() {
    document.removeEventListener('mousemove', handleTimelineScrubMove);
    document.removeEventListener('mouseup', handleTimelineScrubEnd);
    state.lastTickTime = Date.now();
}

function handleScrubToPosition(e) {
    const rect = dom.timelineScrubBar.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    
    state.progress = percent;
    updateTimelineUI();
    updateReconstructedStateElements();
}

function stepTimelineBackward() {
    state.progress = Math.max(0, state.progress - 10);
    updateTimelineUI();
    updateReconstructedStateElements();
}

function stepTimelineForward() {
    state.progress = Math.min(100, state.progress + 10);
    updateTimelineUI();
    updateReconstructedStateElements();
}

// ----------------------------------------------------
// INTERACTIVE VISUALIZERS RENDER LOOPS
// ----------------------------------------------------
let graphCtx, galaxyCtx;

function setupCanvasVisualizers() {
    // A. Web Graph Canvas
    const gc = document.getElementById('graph-canvas');
    if (gc) {
        graphCtx = gc.getContext('2d');
        resizeCanvasToParent(gc);
        // Add canvas event listeners for node dragging, panning & zooming
        gc.addEventListener('mousedown', handleGraphMouseDown);
        gc.addEventListener('mousemove', handleGraphMouseMove);
        gc.addEventListener('mouseup', handleGraphMouseUp);
        gc.addEventListener('mouseleave', handleGraphMouseUp);
        gc.addEventListener('wheel', handleGraphWheel, { passive: false });
    }

    // B. Asset Galaxy Canvas
    const gal = document.getElementById('galaxy-canvas');
    if (gal) {
        galaxyCtx = gal.getContext('2d');
        resizeCanvasToParent(gal);
        gal.addEventListener('mousemove', handleGalaxyMouseMove);
    }

    // Run custom Canvas animate loops
    requestAnimationFrame(animateCanvasVisualizers);
}

function resizeCanvasToParent(canvas) {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}

function animateCanvasVisualizers() {
    requestAnimationFrame(animateCanvasVisualizers);
    drawWebGraph();
    drawAssetGalaxy();
}

// ----------------------------------------------------
// VISUALIZER: Web Page Node Graph
// ----------------------------------------------------
function drawWebGraph() {
    if (!graphCtx) return;
    const canvas = graphCtx.canvas;
    
    // Clear canvas
    graphCtx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Get colors from CSS Theme variables
    const primaryColor = getComputedStyle(dom.body).getPropertyValue('--primary').trim();
    const highlightColor = getComputedStyle(dom.body).getPropertyValue('--highlight').trim();
    const borderCol = getComputedStyle(dom.body).getPropertyValue('--border').trim();
    const textCol = getComputedStyle(dom.body).getPropertyValue('--text-main').trim();
    const textMuted = getComputedStyle(dom.body).getPropertyValue('--text-muted').trim();

    // Save context state for zoom & pan translations
    graphCtx.save();
    graphCtx.translate(state.zoomOffset.x, state.zoomOffset.y);
    graphCtx.scale(state.zoomScale, state.zoomScale);

    // 1. Draw Links
    state.graphLinks.forEach(link => {
        const sourceNode = state.graphNodes.find(n => n.id === link.source);
        const targetNode = state.graphNodes.find(n => n.id === link.target);
        
        if (sourceNode && targetNode) {
            // Draw link line
            graphCtx.beginPath();
            graphCtx.moveTo(sourceNode.x, sourceNode.y);
            graphCtx.lineTo(targetNode.x, targetNode.y);
            graphCtx.lineWidth = 1.5 / state.zoomScale; // stabilize line width
            
            // Glow connection links if scanned
            const isActive = sourceNode.isCrawled && targetNode.isCrawled;
            graphCtx.strokeStyle = isActive ? primaryColor : 'rgba(255, 255, 255, 0.05)';
            graphCtx.shadowColor = isActive ? primaryColor : 'transparent';
            graphCtx.shadowBlur = isActive ? 8 : 0;
            graphCtx.stroke();
            graphCtx.shadowBlur = 0; // reset
        }
    });

    // 2. Draw Moving Data Pulses
    updateAndDrawGraphPulses(primaryColor);

    // 3. Draw Nodes
    state.graphNodes.forEach(node => {
        // Draw glowing aura
        if (node.isCrawled) {
            graphCtx.beginPath();
            graphCtx.arc(node.x, node.y, node.r + 6, 0, Math.PI * 2);
            graphCtx.fillStyle = node.status === 'root' ? 'rgba(0, 255, 170, 0.03)' : 'rgba(0, 240, 255, 0.02)';
            graphCtx.fill();
        }

        // Main node circle
        graphCtx.beginPath();
        graphCtx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        
        let nodeFill = 'rgba(10, 15, 30, 0.8)';
        let nodeStroke = 'rgba(255, 255, 255, 0.08)';
        if (node.isCrawled) {
            nodeFill = node.status === 'root' ? 'rgba(0, 255, 170, 0.1)' : 'rgba(0, 240, 255, 0.08)';
            nodeStroke = node.status === 'root' ? highlightColor : primaryColor;
        }

        graphCtx.fillStyle = nodeFill;
        graphCtx.strokeStyle = nodeStroke;
        graphCtx.lineWidth = 2;
        graphCtx.shadowColor = node.isCrawled ? nodeStroke : 'transparent';
        graphCtx.shadowBlur = node.isCrawled ? 10 : 0;
        graphCtx.fill();
        graphCtx.stroke();
        graphCtx.shadowBlur = 0; // reset

        // Draw inner dot
        if (node.isCrawled) {
            graphCtx.beginPath();
            graphCtx.arc(node.x, node.y, 4, 0, Math.PI * 2);
            graphCtx.fillStyle = nodeStroke;
            graphCtx.fill();
        }

        // Draw text label
        graphCtx.fillStyle = node.isCrawled ? textCol : textMuted;
        graphCtx.font = `bold 10px ${state.theme === 'theme-emerald-matrix' ? 'var(--font-code)' : 'var(--font-body)'}`;
        graphCtx.textAlign = 'center';
        graphCtx.fillText(node.id, node.x, node.y - node.r - 8);
        
        // Secondary label
        graphCtx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        graphCtx.font = `8px ${varFontName()}`;
        graphCtx.fillText(node.label, node.x, node.y + node.r + 12);
    });

    graphCtx.restore();
}

function updateAndDrawGraphPulses(color) {
    // Generate new pulses randomly if simulation is crawling
    if (state.isPlaying && state.progress > 5 && state.progress < 75) {
        if (Math.random() < 0.08) {
            // Pick a random link
            const link = state.graphLinks[Math.floor(Math.random() * state.graphLinks.length)];
            const source = state.graphNodes.find(n => n.id === link.source);
            const target = state.graphNodes.find(n => n.id === link.target);
            
            if (source.isCrawled) {
                state.graphPulses.push({
                    x: source.x,
                    y: source.y,
                    tx: target.x,
                    ty: target.y,
                    progress: 0,
                    speed: 0.02 + Math.random() * 0.015
                });
            }
        }
    }

    // Update and draw existing pulses
    for (let i = state.graphPulses.length - 1; i >= 0; i--) {
        const p = state.graphPulses[i];
        p.progress += p.speed;

        if (p.progress >= 1) {
            state.graphPulses.splice(i, 1);
            continue;
        }

        // Linear interpolation
        const currentX = p.x + (p.tx - p.x) * p.progress;
        const currentY = p.y + (p.ty - p.y) * p.progress;

        // Draw pulse particle
        graphCtx.beginPath();
        graphCtx.arc(currentX, currentY, 3, 0, Math.PI * 2);
        graphCtx.fillStyle = color;
        graphCtx.shadowColor = color;
        graphCtx.shadowBlur = 8;
        graphCtx.fill();
        graphCtx.shadowBlur = 0;
    }
}

function varFontName() {
    return state.theme === 'theme-emerald-matrix' ? 'var(--font-code)' : 'var(--font-body)';
}

function handleGraphMouseDown(e) {
    const rect = e.target.getBoundingClientRect();
    
    // Account for zoom and pan translation when checking mouse clicks on nodes
    const mouseX = (e.clientX - rect.left - state.zoomOffset.x) / state.zoomScale;
    const mouseY = (e.clientY - rect.top - state.zoomOffset.y) / state.zoomScale;

    // Detect if clicking on a node
    let clickedNodeIndex = -1;
    for (let i = 0; i < state.graphNodes.length; i++) {
        const n = state.graphNodes[i];
        const dx = mouseX - n.x;
        const dy = mouseY - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= n.r) {
            clickedNodeIndex = i;
            break;
        }
    }

    if (clickedNodeIndex !== -1) {
        state.draggedNodeIndex = clickedNodeIndex;
    } else {
        // Start background panning
        state.isPanning = true;
        state.panStart = {
            x: e.clientX - state.zoomOffset.x,
            y: e.clientY - state.zoomOffset.y
        };
    }
}

function handleGraphMouseMove(e) {
    const rect = e.target.getBoundingClientRect();

    if (state.draggedNodeIndex !== -1) {
        // Dragging a node (adjust calculations to match scale & pan translation offset)
        const mouseX = (e.clientX - rect.left - state.zoomOffset.x) / state.zoomScale;
        const mouseY = (e.clientY - rect.top - state.zoomOffset.y) / state.zoomScale;

        state.graphNodes[state.draggedNodeIndex].x = mouseX;
        state.graphNodes[state.draggedNodeIndex].y = mouseY;
    } else if (state.isPanning) {
        // Panning the canvas background
        state.zoomOffset.x = e.clientX - state.panStart.x;
        state.zoomOffset.y = e.clientY - state.panStart.y;
    }
}

function handleGraphMouseUp() {
    state.draggedNodeIndex = -1;
    state.isPanning = false;
}

function handleGraphWheel(e) {
    e.preventDefault();
    const rect = e.target.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Zooming factor
    const zoomIntensity = 0.1;
    const scrollDelta = e.deltaY < 0 ? 1 : -1;
    const oldScale = state.zoomScale;
    
    state.zoomScale = Math.max(0.5, Math.min(state.zoomScale + scrollDelta * zoomIntensity, 2.5));

    // Stabilize zoom focus location towards mouse pointer coordinates
    state.zoomOffset.x = mouseX - (mouseX - state.zoomOffset.x) * (state.zoomScale / oldScale);
    state.zoomOffset.y = mouseY - (mouseY - state.zoomOffset.y) * (state.zoomScale / oldScale);
}

// ----------------------------------------------------
// VISUALIZER: Asset Galaxy (Orbital Physics Canvas)
// ----------------------------------------------------
function drawAssetGalaxy() {
    if (!galaxyCtx) return;
    const canvas = galaxyCtx.canvas;
    
    galaxyCtx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const highlightColor = getComputedStyle(dom.body).getPropertyValue('--highlight').trim();

    // Draw central gravity core sun
    galaxyCtx.beginPath();
    galaxyCtx.arc(centerX, centerY, 14, 0, Math.PI * 2);
    galaxyCtx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    galaxyCtx.strokeStyle = highlightColor;
    galaxyCtx.lineWidth = 1;
    galaxyCtx.shadowColor = highlightColor;
    galaxyCtx.shadowBlur = 10;
    galaxyCtx.fill();
    galaxyCtx.stroke();
    galaxyCtx.shadowBlur = 0;

    // Draw orbital orbits tracks
    const activeAssets = state.galaxyAssets.filter((a, idx) => {
        // Assets unlock in groups during downloading simulation
        const unlockThreshold = (idx / state.galaxyAssets.length) * 80;
        return state.progress >= unlockThreshold;
    });

    // Draw rings guides
    galaxyCtx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    galaxyCtx.lineWidth = 0.5;
    [80, 120, 140, 180, 210, 230, 260].forEach(r => {
        galaxyCtx.beginPath();
        galaxyCtx.arc(centerX, centerY, r, 0, Math.PI * 2);
        galaxyCtx.stroke();
    });

    // Update and draw asset nodes orbits
    let newHovered = null;

    activeAssets.forEach(asset => {
        // Orbit speed increases during replay acceleration
        const actualSpeed = asset.speed * (state.isPlaying ? state.speed : 0.4);
        asset.angle += actualSpeed;

        const posX = centerX + asset.radius * Math.cos(asset.angle);
        const posY = centerY + asset.radius * Math.sin(asset.angle);

        // Determine color based on node type
        let color = '#ffffff';
        if (asset.type === 'html') color = '#ff5722';
        else if (asset.type === 'css') color = '#00f0ff';
        else if (asset.type === 'js') color = '#ffeb3b';
        else if (asset.type === 'image') color = '#00ffaa';
        else if (asset.type === 'font') color = '#9c27b0';

        // Hover checking
        if (state.mouseX && state.mouseY) {
            const dx = state.mouseX - posX;
            const dy = state.mouseY - posY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= asset.sizeVal + 4) {
                newHovered = asset;
            }
        }

        // Draw glow aura on active nodes
        galaxyCtx.beginPath();
        galaxyCtx.arc(posX, posY, asset.sizeVal + 4, 0, Math.PI * 2);
        galaxyCtx.fillStyle = `rgba(${hexToRgb(color)}, 0.05)`;
        galaxyCtx.fill();

        // Draw planet
        galaxyCtx.beginPath();
        galaxyCtx.arc(posX, posY, asset.sizeVal, 0, Math.PI * 2);
        galaxyCtx.fillStyle = color;
        galaxyCtx.shadowColor = color;
        galaxyCtx.shadowBlur = 8;
        galaxyCtx.fill();
        galaxyCtx.shadowBlur = 0;

        // Label on hovering
        if (newHovered === asset) {
            galaxyCtx.fillStyle = '#ffffff';
            galaxyCtx.font = `10px ${varFontName()}`;
            galaxyCtx.fillText(asset.id, posX, posY - asset.sizeVal - 6);
        }
    });

    state.hoveredAsset = newHovered;
    updateGalaxyTooltip(centerX, centerY);
}

function handleGalaxyMouseMove(e) {
    const rect = e.target.getBoundingClientRect();
    state.mouseX = e.clientX - rect.left;
    state.mouseY = e.clientY - rect.top;
}

function updateGalaxyTooltip() {
    const tip = dom.galaxyTip;
    if (!tip) return;

    if (state.hoveredAsset) {
        const a = state.hoveredAsset;
        tip.innerHTML = `
            <strong>File:</strong> ${a.id}<br>
            <strong>Type:</strong> ${a.type.toUpperCase()}<br>
            <strong>Size:</strong> ${a.size}<br>
            <strong>Validation:</strong> ${a.optimized}<br>
            <strong>Status:</strong> Validated (${a.score})
        `;
        tip.style.display = 'block';
    } else {
        tip.style.display = 'none';
    }
}

// Convert Hex color to RGB string
function hexToRgb(hex) {
    if (hex.startsWith('#')) hex = hex.slice(1);
    if (hex.length === 3) {
        hex = hex.split('').map(x => x + x).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
}

// ----------------------------------------------------
// SIMULATED PIPELINE RECONSTRUCTION TIMINGS
// ----------------------------------------------------
function updateReconstructedStateElements() {
    // 1. Crawler checklist ticks
    // Discovered HTML completes at 15%
    toggleStepState(dom.stepHtml, state.progress >= 15, state.progress >= 5 && state.progress < 15);
    // Extracted CSS completes at 30%
    toggleStepState(dom.stepCss, state.progress >= 30, state.progress >= 15 && state.progress < 30);
    // Parsing JS completes at 50%
    toggleStepState(dom.stepJs, state.progress >= 50, state.progress >= 30 && state.progress < 50);
    // Finding Images completes at 70%
    toggleStepState(dom.stepImages, state.progress >= 70, state.progress >= 50 && state.progress < 70);
    // Resolving typography completes at 85%
    toggleStepState(dom.stepFonts, state.progress >= 85, state.progress >= 70 && state.progress < 85);
    // Optimizing assets completes at 100%
    toggleStepState(dom.stepAssets, state.progress >= 100, state.progress >= 85 && state.progress < 100);

    // 2. Folder box locks and packaging UI
    // HTML folder lights green/locks at 20%
    toggleFolderLock(dom.folderHtml, state.progress >= 20, state.progress >= 5 && state.progress < 20);
    // CSS folder locks at 40%
    toggleFolderLock(dom.folderCss, state.progress >= 40, state.progress >= 20 && state.progress < 40);
    // JS folder locks at 60%
    toggleFolderLock(dom.folderJs, state.progress >= 60, state.progress >= 40 && state.progress < 60);
    // Assets folder locks at 80%
    toggleFolderLock(dom.folderAssets, state.progress >= 80, state.progress >= 60 && state.progress < 80);

    // 3. Web Graph nodes crawl activation
    state.graphNodes.forEach((node, index) => {
        const threshold = (index / state.graphNodes.length) * 60;
        node.isCrawled = state.progress >= threshold;
    });

    // 4. File Tree Explorer file nodes activating/unlocking opacity
    toggleExplorerFile(dom.fileHtml, state.progress >= 20);
    toggleExplorerFile(dom.fileStyleCss, state.progress >= 35);
    toggleExplorerFile(dom.fileAnimationCss, state.progress >= 40);
    toggleExplorerFile(dom.fileAppJs, state.progress >= 60);
    toggleExplorerFile(dom.fileLogo, state.progress >= 75);
    toggleExplorerFile(dom.fileBg, state.progress >= 80);

    // 5. Download Center & Zip compression states
    const compressLog = dom.compresConsoleLog;
    if (state.progress < 5) {
        compressLog.innerHTML = '<div class="log-line">System ready...</div>';
        dom.zipDownloadBtn.disabled = true;
        dom.packagingCube.classList.remove('folded', 'compressing');
    } else if (state.progress >= 5 && state.progress < 50) {
        dom.packagingCube.classList.add('compressing');
        if (compressLog.children.length === 1) {
            logMessage('Initializing scanner buffers...', 'cyan');
            logMessage('Scanning target URL structure: ' + state.url);
        }
    } else if (state.progress >= 50 && state.progress < 90) {
        dom.packagingCube.classList.add('compressing');
        if (compressLog.children.length < 5) {
            logMessage('[DECONSTRUCT] Decompressing source HTML layout tree');
            logMessage('[CSS-PARSER] Mapping variable overrides to variables.css');
            logMessage('[RECONSTRUCT] Compiling layout structure...');
        }
    } else if (state.progress >= 90 && state.progress < 100) {
        if (compressLog.children.length < 9) {
            logMessage('[OPTIMIZE] Minifying scripts and compressing image nodes');
            logMessage('[VALIDATOR] Validating file dependencies & structure');
            logMessage('[BUILD] Preparing ZIP compressed file manifest...');
        }
    } else if (state.progress >= 100) {
        dom.packagingCube.classList.remove('compressing');
        dom.packagingCube.classList.add('folded');
        
        if (compressLog.children.length < 12) {
            logMessage('[BUILD] Bundling archive compression complete!', 'green');
            logMessage('[SUCCESS] WebCloner Reconstructed codebase ready to deploy.', 'green');
            dom.zipDownloadBtn.disabled = false;
            dom.zipDownloadBtn.querySelector('span').innerText = 'Download Zip Package';
        }
    }

    // 6. Flying cubes animation triggers
    triggerResourcePackets();
}

function toggleStepState(element, isCompleted, isActive) {
    if (!element) return;
    if (isCompleted) {
        element.className = 'step-item completed';
        element.querySelector('.step-icon').innerHTML = '<i data-lucide="check-circle-2"></i>';
        element.querySelector('.step-status').innerText = 'Success';
    } else if (isActive) {
        element.className = 'step-item active';
        element.querySelector('.step-icon').innerHTML = '<i data-lucide="loader"></i>';
        element.querySelector('.step-status').innerText = 'Crawl';
    } else {
        element.className = 'step-item';
        element.querySelector('.step-icon').innerHTML = '<i data-lucide="circle"></i>';
        element.querySelector('.step-status').innerText = 'Pending';
    }
    initIcons();
}

function toggleFolderLock(element, isLocked, isActive) {
    if (!element) return;
    if (isLocked) {
        element.className = 'folder-box locked';
        element.querySelector('.folder-top').innerHTML = '<i data-lucide="folder-check"></i>';
    } else if (isActive) {
        element.className = 'folder-box active';
        element.querySelector('.folder-top').innerHTML = '<i data-lucide="folder-open"></i>';
    } else {
        element.className = 'folder-box';
        element.querySelector('.folder-top').innerHTML = '<i data-lucide="folder"></i>';
    }
    initIcons();
}

function toggleExplorerFile(element, isActive) {
    if (!element) return;
    if (isActive) {
        if (element.classList.contains('disabled')) {
            element.classList.remove('disabled');
            element.classList.add('active', 'new-pulse');
            setTimeout(() => element.classList.remove('new-pulse'), 2500);
        }
    } else {
        element.classList.add('disabled');
        element.classList.remove('active', 'new-pulse');
    }
}

function logMessage(text, colorClass = '') {
    const parent = dom.compresConsoleLog;
    if (!parent) return;
    
    const line = document.createElement('div');
    line.className = 'log-line ' + colorClass;
    line.innerText = text;
    parent.appendChild(line);
    parent.scrollTop = parent.scrollHeight;
}

// Injects flying physical cubes flying from Core globe down to reconstruction folders
function triggerResourcePackets() {
    if (!state.isPlaying || state.progress >= 85) return;
    
    // Generate packets at low rates
    if (Math.random() < 0.15) {
        const coreCanvas = document.getElementById('core-globe-canvas');
        if (!coreCanvas) return;

        const startRect = coreCanvas.getBoundingClientRect();
        
        // Pick target folder based on current progress
        let targetFolder = dom.folderHtml;
        if (state.progress >= 20 && state.progress < 40) targetFolder = dom.folderCss;
        else if (state.progress >= 40 && state.progress < 60) targetFolder = dom.folderJs;
        else if (state.progress >= 60) targetFolder = dom.folderAssets;

        if (!targetFolder) return;
        const endRect = targetFolder.getBoundingClientRect();

        const packet = document.createElement('div');
        packet.className = 'packet-node';
        
        // Start position in center of core globe
        const startX = startRect.left + startRect.width / 2;
        const startY = startRect.top + startRect.height / 2;
        
        packet.style.left = `${startX}px`;
        packet.style.top = `${startY}px`;
        
        // Match active theme primary color
        const primColor = getComputedStyle(dom.body).getPropertyValue('--primary').trim();
        packet.style.backgroundColor = primColor;
        packet.style.boxShadow = `0 0 10px ${primColor}`;

        document.body.appendChild(packet);

        // Animate movement using simple translate
        const duration = 1200; // ms
        const startTime = Date.now();

        function stepPacket() {
            const timePassed = Date.now() - startTime;
            let p = timePassed / duration;
            if (p > 1) p = 1;

            // interpolate positions
            const currX = startX + (endRect.left + endRect.width / 2 - startX) * p;
            const currY = startY + (endRect.top + endRect.height / 2 - startY) * p;

            packet.style.left = `${currX}px`;
            packet.style.top = `${currY}px`;

            if (p < 1) {
                requestAnimationFrame(stepPacket);
            } else {
                packet.remove();
                
                // Add a small splash trigger highlight
                targetFolder.classList.add('pulse');
                setTimeout(() => targetFolder.classList.remove('pulse'), 300);
            }
        }

        requestAnimationFrame(stepPacket);
    }
}

// Celebration Confetti explosion when progress hits 100
function triggerSuccessCelebration() {
    if (window.confetti) {
        window.confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#00f0ff', '#f000ff', '#00ff66', '#ff5e62']
        });
    }
}

// ----------------------------------------------------
// AI ASSISTANT TERMINAL CHAT REPLIES
// ----------------------------------------------------
function handleUserSendMessage() {
    const input = dom.chatInput;
    const text = input.value.trim();
    if (!text) return;

    // Append user query bubble
    appendChatBubble(text, 'user');
    input.value = '';

    // Simulate AI response delay
    setTimeout(() => {
        const responseText = getAssistantAIResponse(text);
        appendChatBubble(responseText, 'assistant');
    }, 900);
}

function appendChatBubble(text, sender) {
    const parent = dom.chatMessagesContainer;
    if (!parent) return;

    const row = document.createElement('div');
    row.className = 'chat-msg ' + sender;
    
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.innerText = text;
    
    row.appendChild(bubble);
    parent.appendChild(row);
    scrollToBottomChat();
}

function scrollToBottomChat() {
    const parent = dom.chatMessagesContainer;
    if (parent) parent.scrollTop = parent.scrollHeight;
}

function getAssistantAIResponse(query) {
    query = query.toLowerCase();
    
    if (query.includes('logo') || query.includes('svg')) {
        return 'I discovered "logo.svg" at phase 4 during vector node analysis. I extracted and minified the vector source, reducing the weight from 5.4KB to 2.8KB, and stored it inside the "assets/" folder.';
    }
    
    if (query.includes('css') || query.includes('style')) {
        return 'The CSS structure has been consolidated. I found styles in two separate files. I compiled them into "css/style.css" containing variables corresponding to the original website layout grid, and created "css/animations.css" to preserve hover styles and transitions.';
    }

    if (query.includes('graph') || query.includes('page') || query.includes('structure')) {
        return 'The Website Graph displays the scraped page architecture mapping. During HTML node tree extraction, I discovered 5 core pages. Each node in the Web Graph tab represents a page, and you can drag nodes to adjust the view physics.';
    }

    if (query.includes('download') || query.includes('zip') || query.includes('pack')) {
        return 'Once the Replicator progress reaches 100% (Validate & Deploy phase), the "AI Package Generator" buttons will glow. Click it to compile and download a complete zipped package workspace code containing index.html, styles, and js assets.';
    }

    return 'I have mapped all dependencies for ' + (state.url || 'the target URL') + '. We reconstructed index.html layout, resolved css rules, and packaged them. Ask me about files (e.g. style.css, logo.svg) or folder structures!';
}

// ----------------------------------------------------
// PRO SKILL: DYNAMIC REAL ZIP EXPORT GENERATOR
// ----------------------------------------------------
function generateProjectZIP() {
    if (state.progress < 100) return;

    // Initialize JSZip
    const zip = new JSZip();

    // Template content representing reconstructed site
    const indexHTMLContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reconstructed Website Workspace</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/animations.css">
</head>
<body>
    <!-- Reconstructed Landing Layout -->
    <header class="reconstructed-header">
        <div class="logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                <path d="M2 12h20"></path>
            </svg>
            <span>Cloned Workspace</span>
        </div>
        <nav class="nav-links">
            <a href="#">Home</a>
            <a href="#">About</a>
            <a href="#">Pricing</a>
        </nav>
    </header>

    <main class="hero-section">
        <h1>Welcome to the Reconstructed Project</h1>
        <p>This frontend codebase was successfully deconstructed, validated, and optimized by WebCloner.AI.</p>
        <button class="action-btn">Explore Live</button>
    </main>

    <script src="js/app.js"></script>
</body>
</html>`;

    const styleCSSContent = `:root {
    --primary: #00f0ff;
    --accent: #7000ff;
    --bg-dark: #0a0c14;
    --text-white: #f5f6f8;
}

body {
    background-color: var(--bg-dark);
    color: var(--text-white);
    font-family: system-ui, -apple-system, sans-serif;
    margin: 0;
    padding: 0;
}

.reconstructed-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 40px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.logo {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 700;
}

.nav-links a {
    color: #8b9bb4;
    text-decoration: none;
    margin-left: 20px;
    transition: color 0.2s ease;
}

.nav-links a:hover {
    color: var(--primary);
}

.hero-section {
    text-align: center;
    padding: 100px 20px;
}

.hero-section h1 {
    font-size: 42px;
    margin-bottom: 20px;
}

.action-btn {
    background-color: var(--primary);
    border: none;
    color: #000;
    padding: 12px 28px;
    border-radius: 6px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0, 240, 255, 0.3);
}`;

    const animationsCSSContent = `@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

.action-btn:hover {
    animation: pulse 1s infinite ease-in-out;
}`;

    const appJSContent = `console.log("Reconstructed App workspace loaded successfully.");

document.querySelector('.action-btn').addEventListener('click', () => {
    alert("Interactive UI bindings functioning successfully!");
});`;

    const logoSVGContent = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
</svg>`;

    // Add folders and files
    zip.file("index.html", indexHTMLContent);
    
    const cssFolder = zip.folder("css");
    cssFolder.file("style.css", styleCSSContent);
    cssFolder.file("animations.css", animationsCSSContent);
    
    const jsFolder = zip.folder("js");
    jsFolder.file("app.js", appJSContent);
    
    const assetsFolder = zip.folder("assets");
    assetsFolder.file("logo.svg", logoSVGContent);

    // Build the ZIP archive
    zip.generateAsync({ type: "blob" })
        .then(function (content) {
            // Trigger browser download dialog
            const element = document.createElement("a");
            element.href = URL.createObjectURL(content);
            element.download = "webcloner-workspace-export.zip";
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            
            logMessage('[EXPORT] Workspace ZIP downloaded successfully!', 'green');
        })
        .catch(err => {
            console.error(err);
            logMessage('[ERROR] Failed to compile ZIP archive package.', 'red');
        });
}
