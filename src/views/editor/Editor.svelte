<script>
  import Mousetrap from 'mousetrap'
  import {flatten} from 'lodash'
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()
  
  import Toolbar from './Toolbar.svelte'
  import ToolbarButton from './ToolbarButton.svelte'
  import Doc from './Doc.svelte'

  import site from '../../stores/data/site'
  import {focusedNode,switchEnabled} from '../../stores/app'
  import {undone} from '../../stores/data/draft'
  import {saving,unsaved,loadingSite} from '../../stores/app/misc'
  import modal from '../../stores/app/modal'
  import {undoSiteChange,redoSiteChange} from '../../stores/actions'
  import {id, content} from '../../stores/app/activePage'

  let unlockingPage = false
  let updatingDatabase = false

  // setup key-bindings
  Mousetrap.bind(['mod+s'], (e) => {
    e.preventDefault()
    savePage()
  })

  const editorButtons = [
    [
      {
        id: 'pages',
        title: 'Pages',
        icon: 'th-large',
        onclick: () => modal.show('SITE_PAGES') 
      }
    ],
    [
      {
        title: 'Content', 
        icon: 'database', 
        onclick: () => modal.show('FIELDS')
      }
    ]
  ]

  const developerButtons = [
    [
      {
        id: 'toolbar--pages',
        title: 'Pages',
        icon: 'th-large',
        onclick: () => modal.show('SITE_PAGES') 
      }
    ],
    [
      {
        id: 'toolbar--html',
        title: 'HTML',
        icon: 'fab fa-html5',
        onclick: () => modal.show('WRAPPER'),
      },
      {
        id: 'toolbar--css',
        title: 'CSS',
        icon: 'fab fa-css3',
        onclick: () => modal.show('STYLES')
      },
      {
        id: 'toolbar--fields',
        title: 'Fields',
        icon: 'database',
        onclick: () => modal.show('FIELDS')
      }
    ]
  ]

  function savePage() {
    dispatch('save')
  }

  $: toolbarButtons = $switchEnabled ? developerButtons : editorButtons

  // Show 'are you sure you want to leave prompt' when closing window 
  $: if ($unsaved && window.location.hostname !== 'localhost') {
    window.onbeforeunload = function(e){
      e.returnValue = '';
    };
  } else {
    window.onbeforeunload = function(e){
      delete e['returnValue'];
    };
  }

</script>

<Toolbar on:signOut buttons={$loadingSite ? [] : toolbarButtons} on:toggleView={() => switchEnabled.set(!$switchEnabled)}>
  <ToolbarButton id="undo" title="Undo" icon="undo-alt" on:click={undoSiteChange} buttonStyles="mr-1 bg-gray-600" />
  {#if $undone.length > 0}
    <ToolbarButton id="redo" title="Redo" icon="redo-alt" on:click={redoSiteChange} buttonStyles="mr-1 bg-gray-600" />
  {/if}
  <ToolbarButton id="save" title="Save" icon="save" key="s" loading={$saving} on:click={savePage} disabled={!$unsaved} buttonStyles="mr-1 bg-gray-600" />
  {#if $switchEnabled}
    <ToolbarButton type="primo" title="Build" icon="fas fa-hammer" active={false} on:click={() => modal.show('BUILD')} disabled={updatingDatabase} variant="bg-primored text-gray-900 hover:bg-gray-400" />
  {:else}
    <ToolbarButton variant="bg-primored" type="primo" on:click={() => modal.show('BUILD')} disabled={updatingDatabase}>publish</ToolbarButton>
  {/if}
</Toolbar>

<Doc />  