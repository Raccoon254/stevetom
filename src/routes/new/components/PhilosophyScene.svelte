<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from 'svelte'
	import { browser } from '$app/environment'
	import * as THREE from 'three'

	const dispatch = createEventDispatcher<{ faceChange: { face: number; phrase: string } }>()

	export let currentFace = 0
	export let isManualMode = false

	let container: HTMLDivElement
	let scene: THREE.Scene
	let camera: THREE.PerspectiveCamera
	let renderer: THREE.WebGLRenderer
	let animationId: number
	let cube: THREE.Mesh
	let isVisible = false
	let isAnimating = false
	let autoRotateTimer: ReturnType<typeof setInterval>

	// 6 faces with 6 phrases
	export const phrases = ['Think', 'Make', 'Solve', 'Create', 'Build', 'Dream']

	// Track actual rotation state (continuous, not clamped)
	let targetRotation = { x: 0, y: 0 }
	let currentRotation = { x: 0, y: 0 }
	let velocity = { x: 0, y: 0 }

	// Physics constants
	const DAMPING = 0.92
	const SPRING = 0.08
	const VELOCITY_THRESHOLD = 0.0001

	let observer: IntersectionObserver

	onMount(() => {
		init()
		animate()
		window.addEventListener('resize', onResize)

		observer = new IntersectionObserver(
			(entries) => {
				isVisible = entries[0].isIntersecting
				if (isVisible && !isManualMode) {
					startAutoRotate()
				} else {
					stopAutoRotate()
				}
			},
			{ threshold: 0.2 }
		)
		observer.observe(container)

		dispatch('faceChange', { face: 0, phrase: phrases[0] })
	})

	onDestroy(() => {
		if (animationId) cancelAnimationFrame(animationId)
		if (renderer) renderer.dispose()
		if (observer) observer.disconnect()
		stopAutoRotate()
		if (browser) {
			window.removeEventListener('resize', onResize)
		}
	})

	export function setManualMode(manual: boolean) {
		isManualMode = manual
		if (manual) {
			stopAutoRotate()
		} else if (isVisible) {
			startAutoRotate()
		}
	}

	function startAutoRotate() {
		if (autoRotateTimer || isManualMode) return
		autoRotateTimer = setInterval(() => {
			if (!isAnimating && !isManualMode) {
				autoRotateToNextFace()
			}
		}, 3500)
	}

	function stopAutoRotate() {
		if (autoRotateTimer) {
			clearInterval(autoRotateTimer)
			autoRotateTimer = null as any
		}
	}

	function autoRotateToNextFace() {
		// Cycle through faces: 0->1->2->3->4->5->0
		const nextFace = (currentFace + 1) % 6
		smoothRotateToFace(nextFace)
	}

	// Get the rotation needed to show a specific face
	function getFaceRotation(face: number): { x: number; y: number } {
		// Map face index to rotation
		// 0: Front (Think), 1: Right (Make), 2: Back (Solve),
		// 3: Left (Create), 4: Top (Build), 5: Bottom (Dream)
		switch (face) {
			case 0:
				return { x: 0, y: 0 } // Front
			case 1:
				return { x: 0, y: -Math.PI / 2 } // Right
			case 2:
				return { x: 0, y: -Math.PI } // Back
			case 3:
				return { x: 0, y: -Math.PI * 1.5 } // Left
			case 4:
				return { x: -Math.PI / 2, y: 0 } // Top
			case 5:
				return { x: Math.PI / 2, y: 0 } // Bottom
			default:
				return { x: 0, y: 0 }
		}
	}

	function smoothRotateToFace(faceIndex: number) {
		if (isAnimating) return
		isAnimating = true
		currentFace = faceIndex

		const faceRot = getFaceRotation(faceIndex)

		// Calculate the shortest path to the target rotation
		// Normalize current Y rotation to find shortest path
		const currentY = currentRotation.y % (Math.PI * 2)
		let targetY = faceRot.y

		// Find shortest rotation path
		const diff = targetY - currentY
		if (Math.abs(diff) > Math.PI) {
			targetY = diff > 0 ? targetY - Math.PI * 2 : targetY + Math.PI * 2
		}

		targetRotation = { x: faceRot.x, y: currentRotation.y + (targetY - currentY) }

		dispatch('faceChange', { face: faceIndex, phrase: phrases[faceIndex] })
	}

	// Exposed rotation functions - seamless continuous rotation
	export function rotateLeft() {
		if (isAnimating) return
		isAnimating = true

		// Rotate Y by +90 degrees (counterclockwise)
		targetRotation.y += Math.PI / 2

		// Update current face based on new Y rotation
		updateFaceFromRotation()
	}

	export function rotateRight() {
		if (isAnimating) return
		isAnimating = true

		// Rotate Y by -90 degrees (clockwise)
		targetRotation.y -= Math.PI / 2

		updateFaceFromRotation()
	}

	export function rotateUp() {
		if (isAnimating) return
		isAnimating = true

		// Rotate X by -90 degrees
		targetRotation.x -= Math.PI / 2

		updateFaceFromRotation()
	}

	export function rotateDown() {
		if (isAnimating) return
		isAnimating = true

		// Rotate X by +90 degrees
		targetRotation.x += Math.PI / 2

		updateFaceFromRotation()
	}

	function updateFaceFromRotation() {
		// Determine which face is showing based on rotation
		const xNorm = ((targetRotation.x % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
		const yNorm = ((targetRotation.y % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)

		// Determine face from normalized rotations
		let face = 0

		// Check X rotation first (top/bottom override)
		if (Math.abs(xNorm - Math.PI / 2) < 0.1 || Math.abs(xNorm - Math.PI * 1.5) < 0.1) {
			face = xNorm < Math.PI ? 5 : 4 // Bottom or Top
		} else if (Math.abs(xNorm - Math.PI * 0.5 * 3) < 0.1) {
			face = 4 // Top
		} else {
			// Y rotation determines front/right/back/left
			if (yNorm < Math.PI / 4 || yNorm > (Math.PI * 7) / 4)
				face = 0 // Front
			else if (yNorm < (Math.PI * 3) / 4)
				face = 3 // Left
			else if (yNorm < (Math.PI * 5) / 4)
				face = 2 // Back
			else if (yNorm < (Math.PI * 7) / 4) face = 1 // Right
		}

		if (face !== currentFace) {
			currentFace = face
			dispatch('faceChange', { face, phrase: phrases[face] })
		}
	}

	export function randomFace() {
		if (isAnimating) return
		isAnimating = true

		// Add random spins
		const spinsX = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 2))
		const spinsY = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 2))

		// Pick a random face
		let newFace = currentFace
		while (newFace === currentFace) {
			newFace = Math.floor(Math.random() * 6)
		}

		const faceRot = getFaceRotation(newFace)

		// Add extra spins for dramatic effect
		targetRotation = {
			x: faceRot.x + spinsX * Math.PI * 2,
			y: faceRot.y + spinsY * Math.PI * 2,
		}

		currentFace = newFace
		dispatch('faceChange', { face: newFace, phrase: phrases[newFace] })
	}

	function init() {
		if (!browser) return

		scene = new THREE.Scene()
		scene.background = null

		camera = new THREE.PerspectiveCamera(
			50,
			container.clientWidth / container.clientHeight,
			0.1,
			1000
		)

		// Isometric view
		camera.position.set(20, 15, 20)
		camera.lookAt(0, 0, 0)

		renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
		renderer.setClearColor(0x000000, 0)
		renderer.setSize(container.clientWidth, container.clientHeight)
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		container.appendChild(renderer.domElement)

		// Lighting matching hero cubes
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
		scene.add(ambientLight)

		const directionalLight = new THREE.DirectionalLight(0xffffff, 2.1)
		directionalLight.position.set(10, 20, 10)
		scene.add(directionalLight)

		// White cube with shaded sides (matching hero cubes)
		const geometry = new THREE.BoxGeometry(5, 5, 5)

		const paletteWhite = {
			top: 0xffffff,
			sideLight: 0xe8e8e8,
			sideDark: 0xc0c0c0,
		}

		const materials = [
			new THREE.MeshBasicMaterial({ color: paletteWhite.sideDark }), // right (Make)
			new THREE.MeshBasicMaterial({ color: paletteWhite.sideDark }), // left (Create)
			new THREE.MeshBasicMaterial({ color: paletteWhite.top }), // top (Build)
			new THREE.MeshBasicMaterial({ color: paletteWhite.sideDark }), // bottom (Dream)
			new THREE.MeshBasicMaterial({ color: paletteWhite.sideLight }), // front (Think)
			new THREE.MeshBasicMaterial({ color: paletteWhite.sideLight }), // back (Solve)
		]

		cube = new THREE.Mesh(geometry, materials)
		cube.position.set(0, 0, 0)
		scene.add(cube)
	}

	function onResize() {
		if (!container || !camera || !renderer) return
		camera.aspect = container.clientWidth / container.clientHeight
		camera.updateProjectionMatrix()
		renderer.setSize(container.clientWidth, container.clientHeight)
	}

	function animate() {
		animationId = requestAnimationFrame(animate)

		if (!isVisible || !cube) {
			if (renderer && scene && camera) renderer.render(scene, camera)
			return
		}

		// Physics-based animation
		const dx = targetRotation.x - currentRotation.x
		const dy = targetRotation.y - currentRotation.y

		// Apply spring force
		velocity.x += dx * SPRING
		velocity.y += dy * SPRING

		// Apply damping
		velocity.x *= DAMPING
		velocity.y *= DAMPING

		// Update position
		currentRotation.x += velocity.x
		currentRotation.y += velocity.y

		// Check if animation is complete
		if (
			isAnimating &&
			Math.abs(dx) < 0.01 &&
			Math.abs(dy) < 0.01 &&
			Math.abs(velocity.x) < VELOCITY_THRESHOLD &&
			Math.abs(velocity.y) < VELOCITY_THRESHOLD
		) {
			currentRotation.x = targetRotation.x
			currentRotation.y = targetRotation.y
			velocity.x = 0
			velocity.y = 0
			isAnimating = false
		}

		cube.rotation.x = currentRotation.x
		cube.rotation.y = currentRotation.y

		// Gentle floating effect
		const time = Date.now() * 0.001
		cube.position.y = Math.sin(time * 0.8) * 0.15

		renderer.render(scene, camera)
	}
</script>

<div bind:this={container} class="philosophy-cube-scene"></div>

<style>
	.philosophy-cube-scene {
		width: 100%;
		height: 100%;
	}
</style>
