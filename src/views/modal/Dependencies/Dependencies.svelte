<script>
  import {writable} from 'svelte/store'

  import modal from '../../../stores/app/modal'

  import ModalHeader from '../ModalHeader.svelte'
  import Libraries from './_Libraries.svelte'

</script>

<ModalHeader 
  icon="fas fa-cube"
  title="Page Dependencies"
  button={{
    label: `Draft`,
    icon: 'fas fa-check',
    onclick: () => {
      modal.hide()
    }
  }}
  variants="mb-4"
/>

<div class="flex flex-col h-full">

</div>
