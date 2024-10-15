<script>
  import { onMount } from 'svelte';
  import './cursor.css';

  let position = { x: 0, y: 0 };
  let hovered = false;
  let textHovered = false;

  let cursorPosition = { x: 0, y: 0 };
  let smoothPosition = { x: 0, y: 0 };
  let scrollOffset = 0;

  onMount(() => {
    const handleMouseMove = (e) => {
      cursorPosition = {
        x: e.clientX,
        y: e.clientY + scrollOffset,
      };
    };

    const handleScroll = () => {
      scrollOffset = window.scrollY;
      cursorPosition.y += window.scrollY - scrollOffset;
    };

    const updatePosition = () => {
      smoothPosition = {
        x: smoothPosition.x + (cursorPosition.x - smoothPosition.x) * 0.1,
        y: smoothPosition.y + (cursorPosition.y - smoothPosition.y) * 0.1,
      };

      position = {
        x: smoothPosition.x,
        y: smoothPosition.y,
      };

      requestAnimationFrame(updatePosition);
    };

    const addHoverClass = (e) => {
      const target = e.target;
      if (target.classList.contains('text-interactive')) {
        textHovered = true;
      } else {
        hovered = true;
      }
    };

    const removeHoverClass = () => {
      hovered = false;
      textHovered = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    requestAnimationFrame(updatePosition);

    const interactiveElements = document.querySelectorAll('.interactive, .text-interactive');
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', addHoverClass);
      el.addEventListener('mouseleave', removeHoverClass);
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(updatePosition);
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', addHoverClass);
        el.removeEventListener('mouseleave', removeHoverClass);
      });
    };
  });
</script>

<div
  class={`cursor ${hovered ? 'hovered' : ''} ${textHovered ? 'text-hover' : ''}`}
  style="left: {position.x}px; top: {position.y}px;"
/>