<script lang="ts">
    import { onMount } from 'svelte';
    import * as THREE from 'three';

    let container: HTMLDivElement;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let particles: THREE.Points;
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

        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

        // Create morphing particles
        const geometry = new THREE.BufferGeometry();
        const particleCount = 1500;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const basePositions: { x: number, y: number, z: number }[] = [];

        const color1 = new THREE.Color(isDark ? 0x3b82f6 : 0x2563eb); // Blue
        const color2 = new THREE.Color(isDark ? 0x10b981 : 0x059669); // Green
        const color3 = new THREE.Color(isDark ? 0x8b5cf6 : 0x7c3aed); // Purple

        for (let i = 0; i < particleCount; i++) {
            // Random cloud of particles
            const x = (Math.random() - 0.5) * 4;
            const y = (Math.random() - 0.5) * 4;
            const z = (Math.random() - 0.5) * 4;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            basePositions.push({ x, y, z });

            const color = Math.random() > 0.66 ? color1 : Math.random() > 0.33 ? color2 : color3;
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.04,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });

        particles = new THREE.Points(geometry, material);
        scene.add(particles);

        // Mouse move handler
        const handleMouseMove = (event: MouseEvent) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Animation loop
        let time = 0;
        function animate() {
            animationId = requestAnimationFrame(animate);

            time += 0.01;

            const positions = geometry.getAttribute('position') as THREE.BufferAttribute;

            for (let i = 0; i < particleCount; i++) {
                const base = basePositions[i];

                const theta = Math.asin(base.y / 2);
                const phi = Math.atan2(base.z, base.x);

                // Define 7 different shapes
                // 1. Sphere
                const sphereRadius = 2;
                const sphere = {
                    x: sphereRadius * Math.cos(theta) * Math.cos(phi),
                    y: sphereRadius * Math.sin(theta),
                    z: sphereRadius * Math.cos(theta) * Math.sin(phi)
                };

                // 2. Torus
                const torusRadius = 2;
                const tubeRadius = 0.8;
                const torus = {
                    x: (torusRadius + tubeRadius * Math.cos(theta * 3)) * Math.cos(phi),
                    y: tubeRadius * Math.sin(theta * 3),
                    z: (torusRadius + tubeRadius * Math.cos(theta * 3)) * Math.sin(phi)
                };

                // 3. Cube
                const cubeSize = 2;
                const cube = {
                    x: Math.sign(Math.cos(phi)) * cubeSize,
                    y: Math.sign(Math.sin(theta)) * cubeSize,
                    z: Math.sign(Math.sin(phi)) * cubeSize
                };

                // 4. Helix
                const helixRadius = 1.5;
                const helix = {
                    x: helixRadius * Math.cos(theta * 5),
                    y: theta * 2,
                    z: helixRadius * Math.sin(theta * 5)
                };

                // 5. Double Helix
                const doubleHelixRadius = 1.2;
                const doubleHelix = {
                    x: doubleHelixRadius * Math.cos(theta * 4 + phi),
                    y: theta * 1.5,
                    z: doubleHelixRadius * Math.sin(theta * 4 + phi)
                };

                // 6. Knot
                const knotRadius = 1.5;
                const knot = {
                    x: (knotRadius + Math.cos(theta * 3)) * Math.cos(phi * 2),
                    y: (knotRadius + Math.cos(theta * 3)) * Math.sin(phi * 2),
                    z: Math.sin(theta * 3)
                };

                // 7. Star/Spiky sphere
                const spikeRadius = 2 + Math.abs(Math.sin(phi * 5) * Math.cos(theta * 5)) * 0.5;
                const star = {
                    x: spikeRadius * Math.cos(theta) * Math.cos(phi),
                    y: spikeRadius * Math.sin(theta),
                    z: spikeRadius * Math.cos(theta) * Math.sin(phi)
                };

                // Cycle through shapes
                const shapes = [sphere, knot, torus, helix, doubleHelix, star];
                const cycleSpeed = 0.3;
                const shapeIndex = (time * cycleSpeed) % shapes.length;
                const currentShapeIndex = Math.floor(shapeIndex);
                const nextShapeIndex = (currentShapeIndex + 1) % shapes.length;
                const blendFactor = shapeIndex - currentShapeIndex;

                const currentShape = shapes[currentShapeIndex];
                const nextShape = shapes[nextShapeIndex];

                // Interpolate between current and next shape
                const x = currentShape.x * (1 - blendFactor) + nextShape.x * blendFactor;
                const y = currentShape.y * (1 - blendFactor) + nextShape.y * blendFactor;
                const z = currentShape.z * (1 - blendFactor) + nextShape.z * blendFactor;

                // Add wave distortion
                const wave = Math.sin(i * 2 + time * 2) * 0.1;

                positions.setXYZ(
                    i,
                    x + wave,
                    y + wave,
                    z + wave
                );
            }

            positions.needsUpdate = true;

            // Interactive rotation based on mouse
            particles.rotation.y += (mouseX * 0.5 - particles.rotation.y) * 0.05;
            particles.rotation.x += (mouseY * 0.5 - particles.rotation.x) * 0.05;

            // Auto rotation
            particles.rotation.y += 0.003;

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

<div bind:this={container} class="w-full h-full min-h-[400px]"></div>