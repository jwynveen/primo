import Number from './Number.svelte'
import Content from './Content.svelte'
import Switch from './Switch.svelte'
import URL from './URL.svelte'
import Link from './Link.svelte'

export default [ 
  {
    id: 'content',
    label: 'Copy',
    component: Content
  },
  {
    id: 'number',
    label: 'Number',
    component: Number
  },
  {
    id: 'switch',
    label: 'Switch',
    component: Switch
  },
  {
    id: 'url',
    label: 'URL',
    component: URL
  },
  {
    id: 'link',
    label: 'Link',
    component: Link
  }
]