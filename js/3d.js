
let scene, camera, renderer, loadedModel;

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


    
    camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.set(0, 0, 6);
    camera.lookAt(0, 0, 0);


      
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-5, 0, -5);
    scene.add(fillLight);

    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
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

    
    // (previously this line spun loadedModel.rotation.y += 0.005)

    
    renderer.render(scene, camera);
}