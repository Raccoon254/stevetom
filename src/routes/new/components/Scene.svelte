<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte'
	import { browser } from '$app/environment'
	import * as THREE from 'three'

	const dispatch = createEventDispatcher()

	let container: HTMLDivElement
	let scene: THREE.Scene
	let camera: THREE.OrthographicCamera
	let renderer: THREE.WebGLRenderer
	let animationId: number
	let cube: THREE.Mesh
	let topCube: THREE.Mesh
	let sphere: THREE.Mesh
	let scrollY = 0

	onMount(() => {
		init()
		animate()
		window.addEventListener('resize', onResize)
		window.addEventListener('scroll', onScroll)

		// Trigger initial load animations
		animateOnLoad()

		// Notify parent that scene is loaded
		setTimeout(() => {
			dispatch('loaded')
		}, 100)
	})

	onDestroy(() => {
		if (animationId) cancelAnimationFrame(animationId)
		if (renderer) renderer.dispose()
		if (browser) {
			window.removeEventListener('resize', onResize)
			window.removeEventListener('scroll', onScroll)
		}
	})

	function onScroll() {
		scrollY = window.scrollY
	}

	function animateOnLoad() {
		// Animate Top Cube from y=0 to y=7
		const topCubeStartY = 0
		const topCubeEndY = 7

		// Animate Sphere from y=-27 to y=-17
		const sphereStartY = -27
		const sphereEndY = -17

		const duration = 1500 // 1.5 seconds
		const startTime = Date.now()

		function animateStep() {
			const elapsed = Date.now() - startTime
			const progress = Math.min(elapsed / duration, 1)

			// Easing function (ease-out cubic)
			const eased = 1 - Math.pow(1 - progress, 3)

			if (topCube) {
				topCube.position.y = topCubeStartY + (topCubeEndY - topCubeStartY) * eased
			}

			if (sphere) {
				sphere.position.y = sphereStartY + (sphereEndY - sphereStartY) * eased
			}

			if (progress < 1) {
				requestAnimationFrame(animateStep)
			}
		}

		animateStep()
	}

	function init() {
		if (!browser) return
		// Scene setup
		scene = new THREE.Scene()
		// Transparent background to show HTML bg
		scene.background = null

		// Camera setup for Isometric view
		const aspect = container.clientWidth / container.clientHeight
		const d = 35 // Increased scale slightly to fit 3 cubes comfortably
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
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.9) // Increased from 0.5
		scene.add(ambientLight)

		const directionalLight = new THREE.DirectionalLight(0xffffff, 2.1) // Increased from 0.8
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
		topCube = new THREE.Mesh(geometry, createMaterials(paletteWhite))
		// Start at y=0 for load animation, will animate to y=7
		topCube.position.set(7, 9, 7)
		scene.add(topCube)

		// Bottom Cube (White with shaded sides)
		const bottomCube = new THREE.Mesh(geometry, createMaterials(paletteWhite))
		bottomCube.position.set(0, 0, 0) // Down
		scene.add(bottomCube)

		// Bottom Right Cube (White with shaded sides)
		const bottomRightCube = new THREE.Mesh(geometry, createMaterials(paletteWhite))
		bottomRightCube.position.set(7, 0, 0) // Right
		scene.add(bottomRightCube)

		// Bottom Left Cube (White with shaded sides)
		const bottomLeftCube = new THREE.Mesh(geometry, createMaterials(paletteWhite))
		bottomLeftCube.position.set(0, 0, 7) // Forward/Left
		scene.add(bottomLeftCube)

			// Bottom Cube (White with shaded sides)
		const bottomCube1 = new THREE.Mesh(geometry, createMaterials(paletteWhite))
		bottomCube1.position.set(0, -20, 20) // Down
		scene.add(bottomCube1)

		// Bottom Right Cube (White with shaded sides)
		const bottomRightCube1= new THREE.Mesh(geometry, createMaterials(paletteWhite))
		bottomRightCube1.position.set(7, -20, 20) // Right
		scene.add(bottomRightCube1)

		// Bottom Left Cube (White with shaded sides)
		const bottomLeftCube1 = new THREE.Mesh(geometry, createMaterials(paletteWhite))
		bottomLeftCube1.position.set(0, -20, 27) // Forward/Left
		scene.add(bottomLeftCube1)

		// Bottom Right Cube (White with shaded sides)
		const bottomRightCube2= new THREE.Mesh(geometry, createMaterials(paletteWhite))
		bottomRightCube2.position.set(7, 20, -27) // Right
		scene.add(bottomRightCube2)

		// Sphere (White with 3D shading from lighting)
		const sphereGeometry = new THREE.SphereGeometry(2, 32, 32)
		const sphereMaterial = new THREE.MeshStandardMaterial({
			color: 0xffffff, // White
			roughness: 0.6,
			metalness: 0.1,
		})
		sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
		// Start at y=-27 for load animation, will animate to y=-17
		sphere.position.set(7, -27, 7)
		scene.add(sphere)
	}

	function onResize() {
		if (!container || !camera || !renderer) return
		const aspect = container.clientWidth / container.clientHeight
		const d = 40
		camera.left = -d * aspect
		camera.right = d * aspect
		camera.top = d
		camera.bottom = -d
		camera.updateProjectionMatrix()
		renderer.setSize(container.clientWidth, container.clientHeight)
	}

	function animate() {
		animationId = requestAnimationFrame(animate)

		// Apply scroll-based transformations
		if (topCube && sphere) {
			// Move objects based on scroll position
			// Adjust these values to control the scroll effect intensity
			const scrollFactor = 0.02

			// Top cube moves up when scrolling down
			topCube.position.y = 7 + scrollY * scrollFactor

			// Sphere moves down when scrolling down
			sphere.position.y = -17 + scrollY * scrollFactor
		}

		renderer.render(scene, camera)
	}
</script>

<div bind:this={container} class="w-full h-full min-h-screen"></div>

<style>
</style>
