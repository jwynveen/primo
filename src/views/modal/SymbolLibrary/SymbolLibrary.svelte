<script context="module">
  import { writable } from 'svelte/store'
  const originalButton = writable(null)
  const publicSymbols = writable([])
</script>

<script>
  import { createEventDispatcher, onMount } from 'svelte'
  import _ from 'lodash'
  import { Tabs } from '../../../components/misc'
  import axios from 'axios'

  import ModalHeader from '../ModalHeader.svelte'
  import Container from './SymbolContainer.svelte'
  import Spinner from '../../../components/misc/Spinner.svelte'
  import { createSymbol } from '../../../const'
  import { createUniqueID } from '../../../utilities'
  // import { sites } from '../../../../supabase/db'
  import { userRole } from '../../../stores/app'
  import modal from '../../../stores/app/modal'
  import { symbols } from '../../../stores/data/draft'
  import { symbols as actions, emancipateInstances } from '../../../stores/actions'

  export let button

  if (button) originalButton.set(button) // save the button originally passed in so it doesn't get lost when editing the symbol

  function editSymbol(symbol) {
    modal.show('COMPONENT_EDITOR', {
      component: symbol,
      header: {
        title: `Edit ${symbol.title || 'Symbol'}`,
        icon: 'fas fa-clone',
        button: {
          label: `Draft Symbol`,
          icon: 'fas fa-check',
          onclick: (symbol) => {
            placeSymbol(symbol)
            actions.update(symbol)
            modal.show('SYMBOL_LIBRARY')
          },
        },
      },
    })
  }

  async function placeSymbol(symbol) {
    const exists = _.some($symbols, ['id', symbol.id])
    if (exists) {
      actions.update(symbol)
    } else {
      actions.create(symbol)
    }
  }

  async function addSymbol() {
    const symbol = createSymbol()
    editSymbol(symbol)
  }

  async function deleteSymbol(symbol) {
    await emancipateInstances(symbol)
    actions.delete(symbol)
  }

  function addComponentToPage(symbol) {
    const instance = createInstance(symbol)
    button ? button.onclick(instance) : $originalButton.onclick(instance)
  }

  function getID(symbol) {
    return symbol.id + symbol.value.html + symbol.value.css
  }

  function createInstance(symbol) {
    const instanceID = createUniqueID()
    return {
      type: 'component',
      id: instanceID,
      symbolID: symbol.id,
      value: {
        fields: symbol.value.fields
      },
    }
  }

  let LZ
  async function copySymbol(symbol) {
    if (!navigator.clipboard) {
      alert(
        'Unable to copy Symbol because your browser does not support copying'
      )
      return
    }

    const currentlyCopied = await navigator.clipboard.readText()
    const copiedSymbols = parseCopiedSymbols(currentlyCopied)
    const symbolsToCopy = [...copiedSymbols, symbol]
    const jsonSymbols = JSON.stringify(symbolsToCopy)
    const compressedSymbols = LZ.compressToBase64(jsonSymbols)
    await navigator.clipboard.writeText(compressedSymbols)
  }

  async function pasteSymbol() {
    const compressedSymbols = await navigator.clipboard.readText()
    const symbols = parseCopiedSymbols(compressedSymbols)
    symbols.forEach((symbol) => {
      placeSymbol({
        ...symbol,
        id: createUniqueID(),
      })
    })
    await navigator.clipboard.writeText(``)
  }

  function parseCopiedSymbols(compressedSymbols) {
    try {
      const json = LZ.decompressFromBase64(compressedSymbols)
      const parsedSymbols = JSON.parse(json)
      if (Array.isArray(parsedSymbols)) {
        return parsedSymbols
      } else {
        throw Error
      }
    } catch (e) {
      console.log(e)
      return []
    }
  }

  let mounted
  onMount(async () => {
    setTimeout(() => {
      mounted = true
    }, 3000)
    if (!LZ) {
      LZ = (await import('lz-string')).default
    }
  })

  const tabs = [
    {
      id: 'site',
      label: 'Site Library',
      icon: 'clone',
    },
    {
      id: 'public',
      label: 'Public Library',
      icon: 'users',
    },
  ]

  let activeTab = tabs[0]

  async function getSymbols() {
    window.plausible('Get Public Library')
    // const {data} = await sites.get({ path: 'mateo/public-library' })
    // $publicSymbols = data.symbols
    $publicSymbols = []
  }

  $: if ($publicSymbols.length === 0 && activeTab === tabs[1]) {
    getSymbols()
  }

</script>

<ModalHeader icon="fas fa-clone" title="Symbols" variants="mb-2" />

<Tabs {tabs} bind:activeTab variants="mt-2 mb-4" />

  <div class="mt-2">
    {#if activeTab === tabs[0]}
      <ul
        class="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
        xyz="fade stagger stagger-2"
      >
        <li
          class="xyz-in library-buttons text-gray-100 bg-codeblack flex rounded overflow-hidden"
        >
          {#if $userRole === 'developer'}
            <button
              on:click={addSymbol}
              class="py-2 border-r flex-1 flex justify-center items-center bg-codeblack hover:bg-primored focus:outline-none focus:border-2 border-primored transition-colors duration-100"
            >
              <svg
                class="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                ><path
                  fill-rule="evenodd"
                  d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                /></svg
              >
              <span>Create</span>
            </button>
          {/if}
          <button
            on:click={pasteSymbol}
            class="py-2 flex-1 flex justify-center items-center bg-codeblack text-gray-100 hover:bg-primored focus:outline-none focus:border-2 border-primored transition-colors duration-100"
          >
            <svg
              class="w-4 h-4 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
              ><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path
                d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"
              /></svg
            >
            <span>Paste</span>
          </button>
        </li>
        {#each $symbols as symbol (getID(symbol))}
          <li class="xyz-in">
            <Container
              titleEditable
              {symbol}
              loadPreview={mounted}
              on:copy={() => copySymbol(symbol)}
              buttons={[
                {
                  onclick: () => editSymbol(symbol),
                  label: 'Edit Symbol',
                  svg: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>`,
                },
                {
                  onclick: () => deleteSymbol(symbol),
                  label: 'Delete Symbol',
                  svg: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>`,
                },
                {
                  onclick: () => addComponentToPage(symbol),
                  highlight: true,
                  label: 'Select Symbol',
                  svg: `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd"></path></svg>`,
                },
              ]}
            />
          </li>
        {/each}
      </ul>
    {:else}
      <ul
        class="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
        xyz="fade stagger stagger-2"
      >
      {#each $publicSymbols as symbol (getID(symbol))}
        <li class="xyz-in">
          <Container
            titleEditable={false}
            on:copy={() => {
              window.plausible('Copy Symbol', { props: { id: symbol.id } })
              copySymbol(symbol)
            }}
            {symbol}
          />
        </li>
      {:else}
        <Spinner />
      {/each}
      </ul>
    {/if}
  </div>

<style>
  .library-buttons:only-child {
    @apply grid grid-cols-2 col-span-4 gap-2;
  }
  .library-buttons:only-child button {
    @apply py-4 text-xl border-0;
  }
  .library-buttons:only-child svg {
    @apply w-6 h-6;
  }
</style>
