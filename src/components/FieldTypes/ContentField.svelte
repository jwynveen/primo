<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let field

  export let disabled = false
  export let title = null;
  export let variants = ''

</script>

<label class="flex flex-col text-xl font-medium {variants}">
  <span class="mb-2 text-sm">{ field.label }</span>
  <input 
    class="input"
    {title}
    {disabled}
    type="text"
    bind:value={field.value} 
    on:input={() => dispatch('input')} 
  >
</label>

<style>
  input {
    @apply bg-gray-800 p-2 ;
  }
</style>