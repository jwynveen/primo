import _ from "lodash";
import axios from "axios";
import { getContext } from "svelte";
import { get } from "svelte/store";
// import ShortUniqueId from "short-unique-id";
import { customAlphabet } from 'nanoid'
import objectPath from "object-path";
import {createUniqueID} from './utilities'

import {id, wrapper as pageWrapper} from './stores/app/activePage'
import {getAllFields} from './stores/helpers'
import Handlebars from 'handlebars/dist/handlebars.min.js'

export async function parseHandlebars(code, data) {
  let res 
  try {
    const template = Handlebars.compile(code);
    res = template(data);
  } catch(e) {
    const error = e.toString().replace(/\n/g, "<br />")
    res = `<pre class="flex justify-start p-8 items-center bg-red-100 text-red-900 h-screen font-mono text-xs lg:text-sm xl:text-md">${error}</pre>`
  }
  return res
}

export function convertFieldsToData(fields) {
  let literalValueFields = fields
    .map((f) => ({
      key: f.key,
      value: f.type === "number" ? parseInt(f.value) : f.value,
    }))
    .reduce((obj, item) => ((obj[item.key] = item.value), obj), {});

  const parsedFields = fields.map((field) => {
    if (field.type === "group") {
      if (field.fields) {
        field.value = _.chain(field.fields)
          .keyBy("key")
          .mapValues("value")
          .value();
      }
    }
    return field;
  })

  return _.chain(parsedFields).keyBy("key").mapValues("value").value();
}

// Lets us debounce from reactive statements
export function createDebouncer(time) {
  return _.debounce((val) => {
    const [fn, arg] = val;
    fn(arg);
  }, time);
}
 
export function createSymbolPreview({ id, wrapper, html, css, js, tailwind }) {
  const twConfig = JSON.stringify({
    mode: 'silent',
    theme: tailwind.theme
  })

  if (wrapper) {
    return `<html hidden>
      <script type="module" src="https://cdn.skypack.dev/twind/shim"></script>
      <script type="twind-config">
        ${twConfig}
      </script>
      <head>${wrapper.head.final}</head>
      <div id="component-${id}">${html}</div>
      <style>${css}</style>
      <script type="module">${js}</script>
      ${wrapper.below.final}`;
  } else {
    return `<html hidden>
      <script type="module" src="https://cdn.skypack.dev/twind/shim"></script>
      <script type="twind-config">
        ${twConfig}
      </script>
      <div id="component-${id}">${html}</div>
      <style>${css}</style>
      <script type="module">${js}</script>`;
  }
}

export function wrapInStyleTags(css, id = null) {
  return `<style type="text/css" ${id ? `id = "${id}"` : ""}>${css}</style>`;
}

export function buildPagePreview(content, tailwind) {
  let html = "";
  for (let block of content) {
    if (block.type === 'component') {
      html += `
      <div class="block" id="block-${block.id}">
        <div class="primo-component" id="component-${block.id}">
          <div>${block.value.final.html}</div>
          <script type="module">${block.value.final.js}</script>
        </div>
      </div>
      `
    } else if (block.type === 'content') {
      html += `
        <div class="block" id="block-${block.id}">
          <div class="primo-copy" id="copy-${block.id}">
            ${block.value.html}
          </div>
        </div>
      `
    }
  }

  const twConfig = JSON.stringify({
    mode: 'silent',
    theme: tailwind.theme
  })

  html += `<script type="module" src="https://cdn.skypack.dev/twind/shim"></script>
  <script type="twind-config">
    ${twConfig}
  </script>`

  // html += get(site).styles // TODO

  return `<html hidden>${html}</html>`;
}

// make a url string valid
export const makeValidUrl = (str = '') => {
  if (str) {
    return str.replace(/\s+/g, '-').replace(/[^0-9a-z\-._]/ig, '').toLowerCase() 
  } else {
    return ''
  }
}