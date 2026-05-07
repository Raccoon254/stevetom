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
	let autoRotateTimer: ReturnType<typeof setInterval>

	// 6 faces with 6 phrases
	export const phrases = ['Think', 'Make', 'Solve', 'Create', 'Build', 'Dream']

	// Track actual rotation state
	let targetRotation = { x: 0, y: 0 }
	let currentRotation = { x: 0, y: 0 }

	// Animation timing
	let animationStart = 0
	let animationDuration = 600 // ms
	let startRotation = { x: 0, y: 0 }
	let isAnimating = false

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
			if (!isManualMode) {
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
		const nextFace = (currentFace + 1) % 6
		smoothRotateToFace(nextFace)
	}

	// Ease-out with slight overshoot for natural feel
	function easeOutBack(t: number): number {
		const c1 = 1.70158
		const c3 = c1 + 1
		return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
	}

	// Start a new animation (accumulates with current position)
	function startAnimation() {
		startRotation = { ...currentRotation }
		animationStart = performance.now()
		animationDuration = 800 // slightly longer for natural motion
		isAnimating = true
	}

	function getFaceRotation(face: number): { x: number; y: number } {
		switch (face) {
			case 0:
				return { x: 0, y: 0 }
			case 1:
				return { x: 0, y: -Math.PI / 2 }
			case 2:
				return { x: 0, y: -Math.PI }
			case 3:
				return { x: 0, y: -Math.PI * 1.5 }
			case 4:
				return { x: -Math.PI / 2, y: 0 }
			case 5:
				return { x: Math.PI / 2, y: 0 }
			default:
				return { x: 0, y: 0 }
		}
	}

	function smoothRotateToFace(faceIndex: number) {
		currentFace = faceIndex

		const faceRot = getFaceRotation(faceIndex)

		// Calculate shortest path
		const currentY = currentRotation.y % (Math.PI * 2)
		let targetY = faceRot.y

		const diff = targetY - currentY
		if (Math.abs(diff) > Math.PI) {
			targetY = diff > 0 ? targetY - Math.PI * 2 : targetY + Math.PI * 2
		}

		targetRotation = { x: faceRot.x, y: currentRotation.y + (targetY - currentY) }
		startAnimation()

		dispatch('faceChange', { face: faceIndex, phrase: phrases[faceIndex] })
	}

	// Allow clicking multiple times - just add to target
	export function rotateLeft() {
		targetRotation.y += Math.PI / 2
		startAnimation()
		updateFaceFromRotation()
	}

	export function rotateRight() {
		targetRotation.y -= Math.PI / 2
		startAnimation()
		updateFaceFromRotation()
	}

	export function rotateUp() {
		targetRotation.x -= Math.PI / 2
		startAnimation()
		updateFaceFromRotation()
	}

	export function rotateDown() {
		targetRotation.x += Math.PI / 2
		startAnimation()
		updateFaceFromRotation()
	}

	function updateFaceFromRotation() {
		const xNorm = ((targetRotation.x % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
		const yNorm = ((targetRotation.y % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)

		let face = 0

		if (Math.abs(xNorm - Math.PI / 2) < 0.1 || Math.abs(xNorm - Math.PI * 1.5) < 0.1) {
			face = xNorm < Math.PI ? 5 : 4
		} else if (Math.abs(xNorm - Math.PI * 0.5 * 3) < 0.1) {
			face = 4
		} else {
			if (yNorm < Math.PI / 4 || yNorm > (Math.PI * 7) / 4) face = 0
			else if (yNorm < (Math.PI * 3) / 4) face = 3
			else if (yNorm < (Math.PI * 5) / 4) face = 2
			else if (yNorm < (Math.PI * 7) / 4) face = 1
		}

		if (face !== currentFace) {
			currentFace = face
			dispatch('faceChange', { face, phrase: phrases[face] })
		}
	}

	export function randomFace() {
		const spinsX = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 2))
		const spinsY = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * 2))

		let newFace = currentFace
		while (newFace === currentFace) {
			newFace = Math.floor(Math.random() * 6)
		}

		const faceRot = getFaceRotation(newFace)

		targetRotation = {
			x: faceRot.x + spinsX * Math.PI * 2,
			y: faceRot.y + spinsY * Math.PI * 2,
		}

		startAnimation()
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

		camera.position.set(20, 15, 20)
		camera.lookAt(0, 0, 0)

		renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
		renderer.setClearColor(0x000000, 0)
		renderer.setSize(container.clientWidth, container.clientHeight)
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		container.appendChild(renderer.domElement)

		const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
		scene.add(ambientLight)

		const directionalLight = new THREE.DirectionalLight(0xffffff, 2.1)
		directionalLight.position.set(10, 20, 10)
		scene.add(directionalLight)

		const geometry = new THREE.BoxGeometry(5, 5, 5)

		const paletteWhite = {
			top: 0xffffff,
			sideLight: 0xe8e8e8,
			sideDark: 0xc0c0c0,
		}

		const materials = [
			new THREE.MeshBasicMaterial({ color: paletteWhite.sideDark }),
			new THREE.MeshBasicMaterial({ color: paletteWhite.sideDark }),
			new THREE.MeshBasicMaterial({ color: paletteWhite.top }),
			new THREE.MeshBasicMaterial({ color: paletteWhite.sideDark }),
			new THREE.MeshBasicMaterial({ color: paletteWhite.sideLight }),
			new THREE.MeshBasicMaterial({ color: paletteWhite.sideLight }),
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

		if (isAnimating) {
			const elapsed = performance.now() - animationStart
			const progress = Math.min(elapsed / animationDuration, 1)
			const eased = easeOutBack(progress)

			// Interpolate from start to target
			currentRotation.x = startRotation.x + (targetRotation.x - startRotation.x) * eased
			currentRotation.y = startRotation.y + (targetRotation.y - startRotation.y) * eased

			if (progress >= 1) {
				currentRotation.x = targetRotation.x
				currentRotation.y = targetRotation.y
				isAnimating = false
			}
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
