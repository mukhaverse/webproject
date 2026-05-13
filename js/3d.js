let scene, camera, renderer, loadedModel;
let meshes = [];
let modelSize = null; 

init();
animate();

function init() {

    const container = document.getElementById('modelContainer');

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    const w = container.clientWidth || 400;
    const h = container.clientHeight || 500;

    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);

    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(13, w / h, 0.1, 1000);
    camera.position.set(0, 12, 12);
    camera.lookAt(0, 0, 0);

    const keyLight = new THREE.DirectionalLight(0xeaf2ff, 1.2);
    keyLight.position.set(3, 6, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-4, 2, -4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.9);
    rimLight.position.set(0, 5, -6);
    scene.add(rimLight);

    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambient);

    const loader = new THREE.GLTFLoader();

    loader.load(
        './assets/models/pill_bottle.glb',

        function (gltf) {

            const model = gltf.scene;

            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            modelSize = size; // save for resize

            const pivot = new THREE.Group();
            pivot.add(model);

            model.position.set(-center.x, -center.y, -center.z);

            scene.add(pivot);
            loadedModel = pivot;

            applyModelScale(); // initial sizing

            model.traverse((child) => {
                if (child.isMesh) {
                    meshes.push(child);
                }
            });

            console.log("Total meshes:", meshes.length);

            const pill1 = [meshes[3], meshes[14]];
            const pill2 = [meshes[9], meshes[18]];
            const pill3 = [meshes[19], meshes[10]];
            const pill4 = [meshes[17], meshes[1]];

            const pillGroups = [pill1, pill2, pill3, pill4];

            addIdleRotation(pillGroups);
            addScrollAnimation(pill1, pill2, pill3, pill4);
        },

        undefined,

        function (error) {
            console.error('GLB load error:', error);
        }
    );

    // Debounced resize handler — updates renderer, camera, AND model scale
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const w = container.clientWidth;
            const h = container.clientHeight;

            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);

            applyModelScale(); // re-scale model without a page refresh
        }, 150);
    });
}


// Central function that picks the right scale + yOffset based on current window width.
// Tweak scaleMultiplier per breakpoint to dial in proportions.
function applyModelScale() {
    if (!loadedModel || !modelSize) return;

    const width = window.innerWidth;
    const maxDim = Math.max(modelSize.x, modelSize.y, modelSize.z);
    const baseScale = 3 / maxDim;

    let scaleMultiplier, yOffset;

    if (width < 768) {
        // Mobile
        scaleMultiplier = 1;
        yOffset = 18;
    } else if (width <= 1024) {
        // iPad / tablet  ← tune scaleMultiplier here (lower = smaller)
        scaleMultiplier = 1;
        yOffset = 15;
    } else if (width <= 1200) {
        // Small laptop / large tablet landscape
        scaleMultiplier = 1.4;
        yOffset = 11;
    } else {
        // Desktop
        scaleMultiplier = 0.54;
        yOffset = 18;
    }

    loadedModel.scale.setScalar(baseScale * scaleMultiplier);
    loadedModel.position.y = modelSize.y * yOffset;
}


function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}


function colorGroup(group, color) {
    group.forEach(mesh => {
        mesh.material = mesh.material.clone();
        mesh.material.color.set(color);
    });
}


function getOthers(...groups) {
    const selected = new Set(groups.flat());
    return meshes.filter(m => !selected.has(m));
}


function addScrollAnimation(pill1, pill2, pill3, pill4) {

    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
        trigger: ".hero-section",
        start: "top top",
        end: "+=200",
        pin: true,
        pinSpacing: true,
    });

    const others = getOthers(pill1, pill2, pill3, pill4);

    function move(group, y, z, finalXOffset = -4, groupIndex = 0) {

        group.forEach((mesh) => {

            if (mesh.userData.baseX === undefined) {
                mesh.userData.baseX = mesh.position.x;
                mesh.userData.baseY = mesh.position.y;
            }

            gsap.to(mesh.position, {
                y: mesh.userData.baseY + y,
                z: mesh.position.z + z,
                x: mesh.userData.baseX + finalXOffset,
                ease: "none",
                scrollTrigger: {
                    trigger: ".hero-section",
                    start: "top top",
                    end: "bottom-=50 top",
                    scrub: true,
                },
                onUpdate: function () {
                    const raw = this.progress();
                    const offset = groupIndex * 0.12;
                    let progress = raw - offset;
                    progress = Math.max(0, Math.min(1, progress));

                    mesh.position.y = mesh.userData.baseY + (y * progress);

                    if (progress < 0.4) {
                        mesh.position.x = mesh.userData.baseX;
                    } else {
                        const t = (progress - 0.4) / 0.4;
                        mesh.position.x = mesh.userData.baseX + (finalXOffset * t);
                    }

                    let scale;
                    if (progress < 0.5) {
                        scale = 1 + (progress * 0.1);
                    } else {
                        const t = (progress - 0.5) / 0.5;
                        scale = 1.05 - (t * 0.05);
                    }
                    mesh.scale.set(scale, scale, scale);
                }
            });
        });
    }

    move(pill1, 1650, 110, -300, 0);
    move(pill2, 1900, 110, -350, 1);
    move(pill3, 2100, 110, -530, 2);
    move(pill4, 2500, 110, -570, 3);
    move(others, -1200, -20, 0, 0);
}


function addIdleRotation(pillGroups) {
    pillGroups.forEach((group, i) => {
        gsap.to(group.map(m => m.rotation), {
            y: "+=0.1",
            x: "+=0.1",
            duration: 2 + i * 0.2,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
        });
    });
}