<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let wrapper: HTMLElement;
  let intervalId: ReturnType<typeof setInterval>;
  
  // Configuration state
  let configuration = 1;
  let roundness = 1;

  // Colors from the user snippet - used for borders
  const colors = [
    'rgb(176, 190, 197)', // 1
    'rgb(245, 245, 245)', // 2
    'rgb(155, 93, 229)',  // 3
    'rgb(241, 91, 181)',  // 4
    'rgb(254, 228, 64)',  // 5
    'rgb(0, 187, 249)',   // 6
    'rgb(0, 245, 212)'    // 7
  ];

  const combinations = [
    { configuration: 1, roundness: 1 },
    { configuration: 1, roundness: 2 },
    { configuration: 1, roundness: 4 },
    { configuration: 2, roundness: 2 },
    { configuration: 2, roundness: 3 },
    { configuration: 3, roundness: 3 }
  ];

  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

  const uniqueRand = (min: number, max: number, prev: number) => {
    let next = prev;
    while(prev === next) next = rand(min, max);
    return next;
  }

  let prev = 0;

  onMount(() => {
    intervalId = setInterval(() => {
      const index = uniqueRand(0, combinations.length - 1, prev);
      const combination = combinations[index];
      
      configuration = combination.configuration;
      roundness = combination.roundness;
      
      prev = index;
    }, 3000);
  });

  onDestroy(() => {
    if (intervalId) clearInterval(intervalId);
  });
</script>

<section class="shape-section">
  <div class="uppercase -mb-44  text-white/70 font-thin text-3xl">
    We make your ideas
    <span class="text-yellow-500 pacifico-regular normal-case">
      Interactive
    </span>
    .
  </div>
  <div id="wrapper" data-configuration={configuration} data-roundness={roundness} bind:this={wrapper}>
    {#each colors as color, i}
      <div class="shape" style="--border-color: {color}">
      </div>
    {/each}
  </div>
</section>

<style>
  .shape-section {
    height: 100vh;
    width: 100vw;
    display: grid;
    place-items: center;
    margin: 0px;
    overflow: hidden;
    position: relative;
  }

  #wrapper {
    aspect-ratio: 1.618;
    width: 90vmin;
    position: relative;
  }

  #wrapper > .shape {
    height: 30%;
    width: 30%;
    background-color: rgba(37, 37, 37, 0.2);
    border: 10px solid var(--border-color);
    position: absolute;
    transition: left 1s cubic-bezier(0.4, 0, 0.2, 1), 
                top 1s cubic-bezier(0.4, 0, 0.2, 1), 
                height 1s cubic-bezier(0.4, 0, 0.2, 1), 
                width 1s cubic-bezier(0.4, 0, 0.2, 1), 
                border-radius 1s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 2;
  }

  /* Specific z-indices from original snippet (adapted) */
  #wrapper > .shape:nth-child(3) { z-index: 1; }

  /* Configuration 1 */
  #wrapper[data-configuration="1"] > .shape:nth-child(1) { left: 0%; top: 0%; height: 50%; width: 20%; }
  #wrapper[data-configuration="1"] > .shape:nth-child(2) { left: 20%; top: 0%; height: 50%; width: 30%; }
  #wrapper[data-configuration="1"] > .shape:nth-child(3) { left: 50%; top: 0%; height: 100%; width: 50%; }
  #wrapper[data-configuration="1"] > .shape:nth-child(4) { left: 0%; top: 50%; height: 50%; width: 30%; }
  #wrapper[data-configuration="1"] > .shape:nth-child(5) { left: 30%; top: 50%; height: 50%; width: 20%; }
  #wrapper[data-configuration="1"] > .shape:nth-child(6) { left: 70%; top: 50%; height: 50%; width: 30%; }
  #wrapper[data-configuration="1"] > .shape:nth-child(7) { left: 85%; top: 75%; height: 25%; width: 15%; }

  /* Configuration 2 */
  #wrapper[data-configuration="2"] > .shape:nth-child(1) { left: 25%; top: 20%; height: 80%; width: 15%; }
  #wrapper[data-configuration="2"] > .shape:nth-child(2) { left: 40%; top: 20%; height: 50%; width: 10%; }
  #wrapper[data-configuration="2"] > .shape:nth-child(3) { left: 50%; top: 0%; height: 100%; width: 25%; }
  #wrapper[data-configuration="2"] > .shape:nth-child(4) { left: 0%; top: 0%; height: 50%; width: 10%; }
  #wrapper[data-configuration="2"] > .shape:nth-child(5) { left: 10%; top: 0%; height: 70%; width: 15%; }
  #wrapper[data-configuration="2"] > .shape:nth-child(6) { left: 75%; top: 10%; height: 80%; width: 15%; }
  #wrapper[data-configuration="2"] > .shape:nth-child(7) { left: 90%; top: 40%; height: 60%; width: 10%; }

  /* Configuration 3 */
  #wrapper[data-configuration="3"] > .shape:nth-child(1) { left: 0%; top: 16.5%; height: 32%; width: 20%; }
  #wrapper[data-configuration="3"] > .shape:nth-child(2) { left: 20%; top: 2.7%; height: 55%; width: 34%; }
  #wrapper[data-configuration="3"] > .shape:nth-child(3) { left: 38%; top: 0%; height: 100%; width: 62%; }
  #wrapper[data-configuration="3"] > .shape:nth-child(4) { left: 0%; top: 47.3%; height: 55%; width: 34%; }
  #wrapper[data-configuration="3"] > .shape:nth-child(5) { left: 34%; top: 56.4%; height: 32%; width: 20%; }
  #wrapper[data-configuration="3"] > .shape:nth-child(6) { left: 66%; top: 45%; height: 55%; width: 34%; }
  #wrapper[data-configuration="3"] > .shape:nth-child(7) { left: 80%; top: 68%; height: 32%; width: 20%; }

  /* Roundness */
  #wrapper[data-roundness="1"] > .shape { border-radius: 6rem; }
  #wrapper[data-roundness="2"] > .shape { border-radius: 0rem; }
  #wrapper[data-roundness="3"] > .shape { border-radius: 30rem; }
  
  #wrapper[data-roundness="4"] > .shape:nth-child(1) { border-bottom-left-radius: 10rem; }
  #wrapper[data-roundness="4"] > .shape:nth-child(2) { border-radius: 20rem; }
  #wrapper[data-roundness="4"] > .shape:nth-child(3) { border-top-right-radius: 12rem; }
  #wrapper[data-roundness="4"] > .shape:nth-child(4) { border-top-right-radius: 10rem; border-bottom-right-radius: 10rem; }
  #wrapper[data-roundness="4"] > .shape:nth-child(5) { border-bottom-left-radius: 10rem; }
  #wrapper[data-roundness="4"] > .shape:nth-child(6) { border-top-left-radius: 16rem; }
  #wrapper[data-roundness="4"] > .shape:nth-child(7) { border-top-left-radius: 10rem; }
</style>
