import { settingValue } from './settings';

const uslug = require('uslug');

// From https://stackoverflow.com/a/6234804/561309
function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function getHeaderPrefix(level: number) {
  /* eslint-disable no-return-await */
  return await settingValue(`h${level}Prefix`);
}

export default async function panelHtml(headers: any[]) {
  // Settings
  const showNumber = await settingValue('showNumber');
  const headerDepth = await settingValue('headerDepth');
  const numberStyle = await settingValue('numberStyle');
  const userStyle = await settingValue('userStyle');
  const disableLinewrap = await settingValue('disableLinewrap');
  const fontFamily = await settingValue('fontFamily');
  const fontSize = await settingValue('fontSize');
  const fontWeight = await settingValue('fontWeight');
  const fontColor = await settingValue('fontColor');
  const bgColor = await settingValue('bgColor');
  const autoUpdate = await settingValue('autoUpdate');

  let linewrapStyle = '';
  if (disableLinewrap) {
    linewrapStyle += `
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;`;
  }

  const slugs: any = {};
  const itemHtml = [];
  const headerCount: number[] = [0, 0, 0, 0, 0, 0];
  
  //14.08.22
  const a = [];
  var x = 0;
  for (const header of headers) {
    if (header.level > headerDepth) {
      continue;
    }
    x += 1;
    a[x]= header.level;
  }

  x = 0;
  for (const header of headers) {
    // header depth
    /* eslint-disable no-continue */
    if (header.level > headerDepth) {
      continue;
    }
    // get slug
    const s = uslug(header.text);
    const num = slugs[s] ? slugs[s] : 1;
    const output = [s];
    if (num > 1) output.push(num);
    slugs[s] = num + 1;
    const slug = output.join('-');

    headerCount[header.level - 1] += 1;
    for (let i = header.level; i < 6; i += 1) {
      headerCount[i] = 0;
    }

    let numberPrefix = '';
    if (showNumber) {
      for (let i = 0; i < header.level; i += 1) {
        numberPrefix += headerCount[i];
        if (i !== header.level - 1) {
          numberPrefix += '.';
        }
      }
    }
    /* eslint-disable no-await-in-loop */
    x += 1;
    var kapitelbeginn = false;
    if (header.level < (a[x+1])) { 
/*      if (autoUpdate) { 
          itemHtml.push(`<details open><summary>`);
        } else {
          itemHtml.push(`<details><summary>`);
        } */
        itemHtml.push(`<details><summary>`);
        kapitelbeginn = true;
    }       
    itemHtml.push(`
          <a id="toc-item-link" class="toc-item-link" href="javascript:;"
          data-slug="${escapeHtml(slug)}" data-lineno="${header.lineno}"
          onclick="tocItemLinkClicked(this.dataset)"
          oncontextmenu="copyInnerLink(this.dataset, this.innerText)"
          style="padding-right:0 !important;`);
          if (!kapitelbeginn) { 
            itemHtml.push(`display: block;padding-left:${(header.level) * 12}px;">`);
          } else { 
            itemHtml.push(`padding-left:${(header.level) * 12 - 12}px;">`);
          }   
    itemHtml.push(`
          <span>${await getHeaderPrefix(header.level)}</span>
          <i style="${numberStyle}">${numberPrefix}</i>
          <span>${escapeHtml(header.text)}</span>
          </a>`);
    if (kapitelbeginn) { 
      itemHtml.push(`</summary>`);    
    } else { 
      for (let i = 1; i <= (a[x] - a[x+1]); i++) { itemHtml.push(`</details>`); }
    }
  }

  const defaultStyle = `
    .outline-content {
      font-family: ${fontFamily};
      min-height: calc(100vh - 1em);
      background-color: ${bgColor};
      padding: 5px
    }
    .container {
      font-size: ${fontSize}pt;
      font-weight: ${fontWeight};
    }
    .toc-item-link {
      padding: 0 2px;
      text-decoration: none;
      color: ${fontColor};
      ${linewrapStyle}
    }
    .toc-item-link:hover {
      font-weight: bold;
    }
    `;

  return `
    <head>
    <style>
    ${defaultStyle}
    ${userStyle}
    </style>
    </head>
    <body>
    <div class="outline-content">
      <!--a id="header" href="javascript:;" onclick="scrollToTop()">OUTLINE</a-->
      <div class="container">
        ${itemHtml.join('\n')}
      </div>
    </div>
    </body>`;
}
