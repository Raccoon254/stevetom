<script lang="ts">
    import { onMount } from 'svelte';
    import * as THREE from 'three';

    let container: HTMLDivElement;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let sphere: THREE.Points;
    let animationId: number;
    let mouseX = 0;
    let mouseY = 0;

    onMount(() => {
        // Scene setup
        scene = new THREE.Scene();

        // Camera setup
        camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        camera.position.z = 5;

        // Renderer setup
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // Create particle sphere
        const geometry = new THREE.BufferGeometry();
        const particleCount = 800;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const primaryColor = isDark ? new THREE.Color(0x3b82f6) : new THREE.Color(0x1d4ed8); // Blue
        const secondaryColor = isDark ? new THREE.Color(0x10b981) : new THREE.Color(0x059669); // Green

        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            const radius = 2;

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            const color = Math.random() > 0.5 ? primaryColor : secondaryColor;
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.08,
            vertexColors: true,
            transparent: true,
            opacity: isDark ? 0.9 : 1,
            sizeAttenuation: true,
            map: createCircleTexture(),
            blending: THREE.NormalBlending
        });

        function createCircleTexture() {
            const size = 32;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d')!;

            const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, size, size);

            return new THREE.CanvasTexture(canvas);
        }

        sphere = new THREE.Points(geometry, material);
        scene.add(sphere);

        // Create particle ring
        const ringGeometry = new THREE.BufferGeometry();
        const ringParticleCount = 300;
        const ringPositions = new Float32Array(ringParticleCount * 3);
        const ringColors = new Float32Array(ringParticleCount * 3);

        const ringColor = isDark ? new THREE.Color(0x8b5cf6) : new THREE.Color(0x7c3aed); // Purple accent

        for (let i = 0; i < ringParticleCount; i++) {
            const angle = (i / ringParticleCount) * Math.PI * 2;
            const radius = 2.6 + Math.random() * 0.4; // Ring thickness

            ringPositions[i * 3] = Math.cos(angle) * radius;
            ringPositions[i * 3 + 1] = (Math.random() - 0.5) * 0.2; // Slight vertical variation
            ringPositions[i * 3 + 2] = Math.sin(angle) * radius;

            ringColors[i * 3] = ringColor.r;
            ringColors[i * 3 + 1] = ringColor.g;
            ringColors[i * 3 + 2] = ringColor.b;
        }

        ringGeometry.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));
        ringGeometry.setAttribute('color', new THREE.BufferAttribute(ringColors, 3));

        const ringMaterial = new THREE.PointsMaterial({
            size: 0.06,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            sizeAttenuation: true,
            map: createCircleTexture(),
            blending: THREE.NormalBlending
        });

        const ring = new THREE.Points(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 14;
        //rotate the ring around Y axis to make it more dynamic
        ring.rotation.y = Math.PI / 10;
        // tilt the ring slightly
        ring.rotation.z = Math.PI / 20;
        scene.add(ring);

        // Mouse move handler
        const handleMouseMove = (event: MouseEvent) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Animation loop
        function animate() {
            animationId = requestAnimationFrame(animate);

            // Rotate sphere based on mouse position
            sphere.rotation.y += (mouseX * 0.5 - sphere.rotation.y) * 0.05;
            sphere.rotation.x += (mouseY * 0.5 - sphere.rotation.x) * 0.05;

            // Auto rotation
            sphere.rotation.y += 0.002;

            // Rotate ring around Y axis (spinning motion)
            ring.rotation.y += 0.015;

            renderer.render(scene, camera);
        }

        animate();

        // Handle resize
        const handleResize = () => {
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            renderer.dispose();
            geometry.dispose();
            if (material instanceof THREE.Material) {
                material.dispose();
            }
            if (container && renderer.domElement) {
                container.removeChild(renderer.domElement);
            }
        };
    });
</script>

<div bind:this={container} class="w-full text-interactive h-full min-h-[400px]"></div>