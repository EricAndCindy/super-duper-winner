import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from "gsap";
import * as dat from "dat.gui";
import vertexShader from "../shader/flylight/vertex.glsl";
import fragmentShader from "../shader/flylight/fragment.glsl";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import Fireworks from "./firework";

// 导入水模块
import { Water } from "three/examples/jsm/objects/Water2";

// 目标：认识shader

//创建gui对象
const gui = new dat.GUI();

// console.log(THREE);
// 初始化场景
const scene = new THREE.Scene();

// 创建透视相机
const camera = new THREE.PerspectiveCamera(
    90,
    window.innerHeight / window.innerHeight,
    0.1,
    1000
);
// 设置相机位置
// object3d具有position，属性是1个3维的向量
camera.position.set(0, 0, 20);
// 更新摄像头
camera.aspect = window.innerWidth / window.innerHeight;
//   更新摄像机的投影矩阵
camera.updateProjectionMatrix();
scene.add(camera);

// 加入辅助轴，帮助我们查看3维坐标轴
// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

// 加载纹理

// 创建纹理加载器对象
const rgbeLoader = new RGBELoader();
rgbeLoader.loadAsync(require('../assets/model/2k.hdr')).then((texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
});

// 创建着色器材质;
const shaderMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {},
    side: THREE.DoubleSide,
    //   transparent: true,
});

// 初始化渲染器
const renderer = new THREE.WebGLRenderer({ alpha: true });
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.BasicShadowMap;
// renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.toneMapping = THREE.LinearToneMapping;
// renderer.toneMapping = THREE.ReinhardToneMapping;
// renderer.toneMapping = THREE.CineonToneMapping;
renderer.toneMappingExposure = 0.1;

const gltfLoader = new GLTFLoader();
let LightBox = null;
gltfLoader.load(require('../assets/model/newyears_min.glb'), (gltf) => {
    console.log(gltf);
    scene.add(gltf.scene);

    //   创建水面
    const waterGeometry = new THREE.PlaneGeometry(100, 100);
    let water = new Water(waterGeometry, {
        scale: 4,
        textureHeight: 1024,
        textureWidth: 1024,
    });
    water.position.y = 1;
    water.rotation.x = -Math.PI / 2;
    scene.add(water);
});


// 设置渲染尺寸大小
renderer.setSize(window.innerWidth, window.innerHeight);

// 监听屏幕大小改变的变化，设置渲染的尺寸
window.addEventListener("resize", () => {
    //   console.log("resize");
    // 更新摄像头
    camera.aspect = window.innerWidth / window.innerHeight;
    //   更新摄像机的投影矩阵
    camera.updateProjectionMatrix();

    //   更新渲染器
    renderer.setSize(window.innerWidth, window.innerHeight);
    //   设置渲染器的像素比例
    renderer.setPixelRatio(window.devicePixelRatio);
});

// 将渲染器添加到body
document.body.appendChild(renderer.domElement);

// 初始化控制器
const controls = new OrbitControls(camera, renderer.domElement);
// 设置控制器阻尼
controls.enableDamping = true;
// 设置自动旋转
controls.autoRotate = true;
controls.autoRotateSpeed = 0.1;
// controls.maxPolarAngle = (Math.PI / 3) * 2;
// controls.minPolarAngle = (Math.PI / 3) * 2;

const clock = new THREE.Clock();
// 管理烟花
let fireworks = [];
function animate(t) {
    controls.update();
    const elapsedTime = clock.getElapsedTime();
    //   console.log(fireworks);
    fireworks.forEach((item, i) => {
        const type = item.update();
        if (type == "remove") {
            fireworks.splice(i, 1);
        }
    });

    requestAnimationFrame(animate);
    // 使用渲染器渲染相机看这个场景的内容渲染出来
    renderer.render(scene, camera);
}

animate();

// 设置创建烟花函数
let createFireworks = () => {
    let color = `hsl(${Math.floor(Math.random() * 360)},100%,80%)`;
    let to = {
        x: (Math.random() - 0.5) * 40,
        z: -(Math.random() - 0.5) * 40,
        y: 3 + Math.random() * 15,
    };

    // 随机生成颜色和烟花放的位置
    let firework = new Fireworks(color, to);
    firework.addScene(scene, camera);
    fireworks.push(firework);
};
// 监听点击事件
window.addEventListener("click", createFireworks);
