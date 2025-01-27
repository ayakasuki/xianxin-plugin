import fs from 'node:fs'
import yaml from 'yaml'
import puppeteer from "../../../lib/puppeteer/puppeteer.js";

let yunzaiEdition = null;
let rendererCfg = null;
let puppeteerRendererClass = null;
let puppeteerInst = null;

function getTempDefaultRendererCfg() {
  return {
    headless: 'new',
    args: [
      '--disable-gpu',
      '--disable-setuid-sandbox',
      '--no-sandbox',
      '--no-zygote'
    ]
  };
}

function getMiaoYunzaiRendererCfg() {
  if (!rendererCfg) {
    let configFile = './renderers/puppeteer/config.yaml';
    if (fs.existsSync(configFile)) {
      try {
        rendererCfg = yaml.parse(fs.readFileSync(configFile, 'utf8'));
      } catch (e) {
        rendererCfg = getTempDefaultRendererCfg();
      }
    } else {
      rendererCfg = getTempDefaultRendererCfg();
    }
  }
  return rendererCfg;
}

function getPm2Cfg() {
  const configFile = './config/pm2/pm2.json';
  if (fs.existsSync(configFile)) {
    let pmcfg = fs.readFileSync(configFile);
    pmcfg = JSON.parse(pmcfg);
    return pmcfg;
  }
  return null;
}

function getStaticEditionTag() {
  const pmcfg = getPm2Cfg();
  if (pmcfg) {
    return pmcfg.apps[0].name;
  }
  return 'TRSS-Yunzai';
}

function getYunzaiEdition() {
  if (!yunzaiEdition) {
    yunzaiEdition = getStaticEditionTag();
  }
  return yunzaiEdition;
}

async function initPuppeteerRenderer() {
  let module = await import('../../../renderers/puppeteer/lib/puppeteer.js');
  puppeteerRendererClass = module.default;
}

export async function getPuppeteer() {
  if (getYunzaiEdition() == 'TRSS-Yunzai') {
    if (!puppeteerRendererClass) await initPuppeteerRenderer();
      if (!puppeteerInst) puppeteerInst = new puppeteerRendererClass(getMiaoYunzaiRendererCfg());
    return puppeteerInst;
  }
  return puppeteer;
}