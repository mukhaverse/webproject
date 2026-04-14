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
            pivot.scale.setScalar(scale *0.54);

            scene.add(pivot);
            loadedModel = pivot;

            pivot.position.y = size.y * 18;

            
            

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

            // color for debugging
            // colorGroup(pill1, 0xff0000); 
            // colorGroup(pill2, 0x00ff00);
            // colorGroup(pill3, 0x0000ff);
            // colorGroup(pill4, 0x4f002f);

            const pillGroups = [pill1, pill2, pill3, pill4];

            addIdleRotation(pillGroups);

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
    });
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
        end: "+=200", // controling where the pin stops
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

                    
                    mesh.position.y =
                        mesh.userData.baseY + (y * progress);

                    
                    if (progress < 0.4) {
                        mesh.position.x = mesh.userData.baseX;
                    } else {
                        const t = (progress - 0.4) / 0.4;
                        mesh.position.x =
                            mesh.userData.baseX +
                            (finalXOffset * t);
                    }

                    // I migth leave it without any scale change since I added the pinning 
                    // but still not sure
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

    
    move(pill1, 1650, 110, -300, 0); //red
    move(pill2, 1900, 110, -350, 1); //green 
    move(pill3, 2100, 110, -530, 2); //blue
    move(pill4, 2500, 110, -570, 3); //purp

   
    move(others, -1200, -20, 0, 0);
}
function addIdleRotation(pillGroups) {

    pillGroups.forEach((group, i) => {

        const rotY = "+=0.1";
        const rotX = "+=0.1";

        
        gsap.to(group.map(m => m.rotation), {
            y: rotY,
            x: rotX,
            duration: 2 + i * 0.2,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
        });

    });
}
