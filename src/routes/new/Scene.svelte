<script lang="ts">
	import { onMount, onDestroy } from 'svelte'
	import { browser } from '$app/environment'
	import * as THREE from 'three'

	let container: HTMLDivElement
	let scene: THREE.Scene
	let camera: THREE.OrthographicCamera
	let renderer: THREE.WebGLRenderer
	let animationId: number
	let sceneObjects: {
		topCube: THREE.Mesh
		bottomCube: THREE.Mesh
		bottomRightCube: THREE.Mesh
		bottomLeftCube: THREE.Mesh
		sphere: THREE.Mesh
	}

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

	// Calculate responsive scale based on viewport
	function getResponsiveScale() {
		if (!container) return { d: 35, scale: 1 }
		const width = container.clientWidth
		const height = container.clientHeight

		// Base dimensions (desktop)
		const baseWidth = 1920
		const baseHeight = 1080

		// Calculate scale factor based on viewport size
		const widthScale = width / baseWidth
		const heightScale = height / baseHeight
		const scale = Math.min(widthScale, heightScale)

		// Adjust camera frustum based on aspect ratio
		const aspect = width / height
		let d = 35

		// Adjust frustum for different aspect ratios
		if (aspect < 1) {
			// Portrait mode - increase frustum
			d = 35 / aspect
		} else if (aspect > 1.5) {
			// Wide screens - adjust slightly
			d = 35 * (aspect / 1.5) * 0.8
		}

		return { d, scale }
	}

	function init() {
		if (!browser) return
		// Scene setup
		scene = new THREE.Scene()
		// Transparent background to show HTML bg
		scene.background = null

		// Camera setup for Isometric view with responsive frustum
		const { d } = getResponsiveScale()
		const aspect = container.clientWidth / container.clientHeight
		camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000)

		// Isometric angle: Look from a corner
		camera.position.set(20, 15, 20)
		camera.lookAt(scene.position)

		// Renderer setup with transparency (no shadows needed)
		renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
		renderer.setClearColor(0x000000, 0)
		renderer.setSize(container.clientWidth, container.clientHeight)
		renderer.setPixelRatio(Math.min(browser ? window.devicePixelRatio : 1, 2))
		container.appendChild(renderer.domElement)

		// Minimal lighting for sphere only (cubes use flat colors)
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
		scene.add(ambientLight)

		const directionalLight = new THREE.DirectionalLight(0xffffff, 2.1)
		directionalLight.position.set(10, 20, 10)
		scene.add(directionalLight)

		// Color palette for 3D effect without lighting
		const paletteWhite = {
			top: 0xffffff, // Bright white top
			sideLight: 0xe8e8e8, // Light gray for lighter sides
			sideDark: 0xc0c0c0, // Medium gray for darker sides
		}

		// Cube geometry
		const geometry = new THREE.BoxGeometry(7, 7, 7)

		const createMaterials = (palette: typeof paletteWhite) => [
			new THREE.MeshBasicMaterial({ color: palette.sideDark }), // right (x+)
			new THREE.MeshBasicMaterial({ color: palette.sideDark }), // left (x-)
			new THREE.MeshBasicMaterial({ color: palette.top }), // top (y+) - white
			new THREE.MeshBasicMaterial({ color: palette.sideDark }), // bottom (y-)
			new THREE.MeshBasicMaterial({ color: palette.sideLight }), // front (z+)
			new THREE.MeshBasicMaterial({ color: palette.sideLight }), // back (z-)
		]

		// Top Cube (White with shaded sides)
		const topCube = new THREE.Mesh(geometry, createMaterials(paletteWhite))
		topCube.position.set(7, 7 + 13, -4 - 23.6)
		scene.add(topCube)

		// Bottom Cube (White with shaded sides)
		const bottomCube = new THREE.Mesh(geometry, createMaterials(paletteWhite))
		bottomCube.position.set(0, 0 + 13, -11 - 23.6)
		scene.add(bottomCube)

		// Bottom Right Cube (White with shaded sides)
		const bottomRightCube = new THREE.Mesh(geometry, createMaterials(paletteWhite))
		bottomRightCube.position.set(7, 0 + 13, -11 - 23.6)
		scene.add(bottomRightCube)

		// Bottom Left Cube (White with shaded sides)
		const bottomLeftCube = new THREE.Mesh(geometry, createMaterials(paletteWhite))
		bottomLeftCube.position.set(0, 0 + 13, -4 - 23.6)
		scene.add(bottomLeftCube)

		// Sphere (White with 3D shading from lighting)
		const sphereGeometry = new THREE.SphereGeometry(3.5, 32, 32)
		const sphereMaterial = new THREE.MeshStandardMaterial({
			color: 0xffffff, // White
			roughness: 0.6,
			metalness: 0.1,
		})
		const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
		sphere.position.set(7, -17 + 13, -4 - 23.6)
		scene.add(sphere)

		// Store references for resize handling
		sceneObjects = { topCube, bottomCube, bottomRightCube, bottomLeftCube, sphere }
	}

	function onResize() {
		if (!container || !camera || !renderer) return

		const { d } = getResponsiveScale()
		const aspect = container.clientWidth / container.clientHeight

		// Update camera frustum
		camera.left = -d * aspect
		camera.right = d * aspect
		camera.top = d
		camera.bottom = -d
		camera.updateProjectionMatrix()

		// Update renderer size
		renderer.setSize(container.clientWidth, container.clientHeight)
	}

	function animate() {
		animationId = requestAnimationFrame(animate)
		renderer.render(scene, camera)
	}
</script>

<div bind:this={container} class="w-full h-full min-h-screen relative"></div>
