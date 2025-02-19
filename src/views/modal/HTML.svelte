<script>
  import {cloneDeep,isEqual} from 'lodash'
  import {Tabs} from '../../components/misc'
  import {CodeMirror} from '../../components'
  import { parseHandlebars, convertFieldsToData } from '../../utils'
  import ModalHeader from './ModalHeader.svelte'

  import modal from '../../stores/app/modal'
  import {getAllFields} from '../../stores/helpers'
  import {wrapper as pageHTML, id} from '../../stores/app/activePage'
  import {unsaved} from '../../stores/app/misc'
  import {wrapper as siteHTML, pages as pagesStore} from '../../stores/data/draft'
  import {pages} from '../../stores/actions'

  let localPageHTML = cloneDeep($pageHTML)
  let localSiteHTML = cloneDeep($siteHTML)

  const tabs = [
    {
      id: 'page',
      label: 'Page',
      icon: 'square'
    },
    {
      id: 'site',
      label: 'Site',
      icon: 'th'
    }
  ]

  let activeTab = tabs[0]

  async function updateHtmlWithFieldData(rawHTML) {
    const allFields = getAllFields()
    const data = await convertFieldsToData(allFields, 'all')
    const finalHTML = await parseHandlebars(rawHTML, data)
    return finalHTML
  }

  async function saveFinalHTML() {
    const wrapper = {
      head: {
        raw: localPageHTML.head.raw,
        final: await updateHtmlWithFieldData(localPageHTML.head.raw)
      },
      below: {
        raw: localPageHTML.below.raw,
        final: await updateHtmlWithFieldData(localPageHTML.below.raw)
      }
    }

    pages.update($id, page => ({
      ...page,
      wrapper
    }))

    $siteHTML.head.raw = localSiteHTML.head.raw
    $siteHTML.head.final = await updateHtmlWithFieldData(localSiteHTML.head.raw)
    $siteHTML.below.raw = localSiteHTML.below.raw
    $siteHTML.below.final = await updateHtmlWithFieldData(localSiteHTML.below.raw)

    $unsaved = true
  }

</script>

<ModalHeader 
  icon="fab fa-html5"
  title="HTML"
  button={{
    label: `Draft`,
    icon: 'fas fa-check',
    onclick: () => {
      saveFinalHTML()
      modal.hide()
    }
  }}
  warn={() => {
    if (!isEqual(localPageHTML, $pageHTML) || !isEqual(localSiteHTML, $siteHTML)) {
      const proceed = window.confirm('Undrafted changes will be lost. Continue?')
      return proceed
    } else return true
  }}
  variants="mb-4"
/>

<div class="flex flex-col">
  <Tabs {tabs} bind:activeTab variants="mb-4" />
  <div class="flex-1">
    {#if activeTab.id === 'page'}
      <span class="mb-1 inline-block font-semibold text-gray-200">{'<head>'}</span> 
        <CodeMirror 
          bind:value={localPageHTML.head.raw} 
          style="height:10rem" 
          mode="html"
        />
    
        <span class="mb-1 mt-4 inline-block font-semibold text-gray-200">{'Before </body>'}</span> 
        <CodeMirror 
          bind:value={localPageHTML.below.raw} 
          style="height:15rem" 
          mode="html"
        />
    {:else}
      <span class="mb-1 inline-block font-semibold text-gray-200">{'<head>'}</span> 
      <CodeMirror 
        bind:value={localSiteHTML.head.raw} 
        style="height:10rem" 
        mode="html"
      />
  
      <span class="mb-1 mt-4 inline-block font-semibold text-gray-200">{'Before </body>'}</span> 
      <CodeMirror 
        bind:value={localSiteHTML.below.raw} 
        style="height:15rem" 
        mode="html"
      />
    {/if}
  </div>
</div>
