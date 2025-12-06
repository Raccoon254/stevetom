<script lang="ts">
	import { onMount, onDestroy } from 'svelte'
	import { browser } from '$app/environment'
	import * as THREE from 'three'

	let container: HTMLDivElement
	let scene: THREE.Scene
	let camera: THREE.OrthographicCamera
	let renderer: THREE.WebGLRenderer
	let animationId: number
	let cube: THREE.Mesh

	onMount(() => {
		init()
		animate()
		window.addEventListener('resize', onResize)
	})

	onDestroy(() => {
		if (animationId) cancelAnimationFrame(animationId)
		if (renderer) renderer.dispose()
		if (browser) window.removeEventListener('resize', onResize)
	})

	function init() {
		if (!browser) return
		// Scene setup
		scene = new THREE.Scene()
        // will be transparent
		scene.background = new THREE.Color(0x00000)

		// Camera setup for Isometric view
		const aspect = container.clientWidth / container.clientHeight
		const d = 40 // Increased scale slightly to fit 3 cubes comfortably
		camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000)

		// Isometric angle: Look from a corner
		camera.position.set(20, 15, 20)
		camera.lookAt(scene.position)

		// Renderer setup
		renderer = new THREE.WebGLRenderer({ antialias: true })
		renderer.setSize(container.clientWidth, container.clientHeight)
		renderer.setPixelRatio(Math.min(browser ? window.devicePixelRatio : 1, 2))
		container.appendChild(renderer.domElement)

		// Palettes
		const palettePink = {
			top: 0xffffff,
			sideLight: 0xfce7f3, // Pale Pink
			sideDark: 0xf9a8d4, // Pink
		}

		const paletteBlue = {
			top: 0xffffff,
			sideLight: 0xe0e7ff, // Pale Lavender (Indigo-100)
			sideDark: 0xa5b4fc, // Periwinkle (Indigo-300)
		}

        const paletteRed = {
            top: 0xffffff,
            sideLight: 0xffe0e0, // Pale Red
            sideDark: 0xff6b6b, // Red
        }

		// Cube geometry
		const geometry = new THREE.BoxGeometry(7, 7, 7)

		const createMaterials = (palette: typeof palettePink) => [
			new THREE.MeshBasicMaterial({ color: palette.sideDark }), // right (x+)
			new THREE.MeshBasicMaterial({ color: palette.sideDark }), // left (x-)
			new THREE.MeshBasicMaterial({ color: palette.top }), // top (y+)
			new THREE.MeshBasicMaterial({ color: palette.sideDark }), // bottom (y-)
			new THREE.MeshBasicMaterial({ color: palette.sideLight }), // front (z+)
			new THREE.MeshBasicMaterial({ color: palette.sideLight }), // back (z-)
		]

		// Top Cube (Pink)
		const topCube = new THREE.Mesh(geometry, createMaterials(palettePink))
        // will start from (7, 0, 7) and then move to (7, 10, 7)
		topCube.position.set(7, 7, 7) // Up
		scene.add(topCube)

        // Bottom Cube (RED)
		const bottomCube = new THREE.Mesh(geometry, createMaterials(paletteRed))
		bottomCube.position.set(0, 0, 0) // Down
		scene.add(bottomCube)

		// Bottom Right Cube (Blue)
		const bottomRightCube = new THREE.Mesh(geometry, createMaterials(paletteBlue))
		bottomRightCube.position.set(7, 0, 0) // Right
		scene.add(bottomRightCube)

		// Bottom Left Cube (Blue)
		const bottomLeftCube = new THREE.Mesh(geometry, createMaterials(paletteBlue))
		bottomLeftCube.position.set(0, 0, 7) // Forward/Left
		scene.add(bottomLeftCube)
	}

	function onResize() {
		if (!container || !camera || !renderer) return
		const aspect = container.clientWidth / container.clientHeight
		const d = 10
		camera.left = -d * aspect
		camera.right = d * aspect
		camera.top = d
		camera.bottom = -d
		camera.updateProjectionMatrix()
		renderer.setSize(container.clientWidth, container.clientHeight)
	}

	function animate() {
		animationId = requestAnimationFrame(animate)
		renderer.render(scene, camera)
	}
</script>

<div bind:this={container} class="w-full h-full min-h-[500px] relative"></div>
