let scene, camera, renderer, loadedModel;
let meshes = [];

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

            const pivot = new THREE.Group();
            pivot.add(model);

            model.position.set(-center.x, -center.y, -center.z);

            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 3 / maxDim;
            pivot.scale.setScalar(scale);

            scene.add(pivot);
            loadedModel = pivot;

            
            

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

            // colors to distinguish between them
            colorGroup(pill1, 0xff0000); 
            colorGroup(pill2, 0x00ff00); 
            colorGroup(pill3, 0x0000ff); 
            colorGroup(pill4, 0x4f002f); 

            
            addScrollAnimation(pill1, pill2, pill3, pill4);

        },

        undefined,

        function (error) {
            console.error('GLB load error:', error);
        }

    );

    window.addEventListener('resize', () => {
        const w = container.clientWidth;
        const h = container.clientHeight;

        camera.aspect = w / h;
        camera.updateProjectionMatrix();

        renderer.setSize(w, h);
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
    });
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}


// color helper 
function colorGroup(group, color) {
    group.forEach(mesh => {
        mesh.material = mesh.material.clone();
        mesh.material.color.set(color);
    });
}



function addScrollAnimation(pill1, pill2, pill3, pill4) {

    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "bottom+=2000 top",
            scrub: true,
        }
    });

    // move entire pill group
    function move(group, y, z, at = 0) {
        group.forEach(mesh => {
            tl.to(mesh.position, {
                y: `+=${y}`,
                z: `+=${z}`,
                ease: "power2.out"
            }, at);
        });
    }

    
    //  1
    move(pill1, 300, 40, 0);
    move(pill2, 320, 50, 0);
    move(pill3, 400, 60, 0);
    move(pill4, 200, 30, 0);

    //  2
    // move(pill2, 200, 30, 0.5);
    move(pill3, 180, 30, 0.5);
    move(pill4, 200, 20, 0.5);

    //  3
    // move(pill3, 200, 30, 1);

}