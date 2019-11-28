import Toolbar from './components/toolbar';
import LiquidFlamegraph from './components/liquid-flamegraph';
import {toggleClass, getProfileData, setTotalTime} from './utils';

import './styles/main.css';

const selectors = {
  refreshButton: '[data-refresh-button]',
  flamegraphContainer: '[data-flamegraph-container]',
  loadingAnimation: '[data-loading-animation]',
  initialMessage: '[data-initial-message]',
  notProfilableMessage: '[data-page-not-profilable]',
  flamegraphWrapper: '[data-flamegraph-wrapper]',
};

let liquidFlamegraph: LiquidFlamegraph;

chrome.devtools.inspectedWindow.eval(
  `typeof window.Shopify === 'object'`,
  function(isShopifyStore: boolean) {
    if (isShopifyStore) {
      chrome.devtools.panels.create('Shopify', '', './devtools.html');
      const toolbar = new Toolbar();

      toolbar.refreshButton.addEventListener('click', refreshPanel);
      toolbar.zoomOutButton.addEventListener('click', zoomOutFlamegraph);
    }
  },
);

async function refreshPanel() {
  document.querySelector(selectors.initialMessage)!.innerHTML = '';
  toggleClass(selectors.flamegraphWrapper, 'loading-fade');
  toggleClass(selectors.loadingAnimation, 'hide');
  document.querySelector(selectors.notProfilableMessage)!.classList.add('hide');

  const profile = await getProfileData();

  toggleClass(selectors.loadingAnimation, 'hide');
  toggleClass(selectors.flamegraphWrapper, 'loading-fade');

  if (profile) {
    liquidFlamegraph = new LiquidFlamegraph(
      document.querySelector(selectors.flamegraphContainer),
      profile,
    );

    setTimeout(function() {
      setTotalTime(profile.value);
    }, 300);

    document
      .querySelector(selectors.flamegraphWrapper)!
      .classList.remove('hide');
  } else {
    document.querySelector(selectors.flamegraphWrapper)!.classList.add('hide');
    document
      .querySelector(selectors.notProfilableMessage)!
      .classList.remove('hide');
  }
}

function zoomOutFlamegraph() {
  if (typeof liquidFlamegraph.flamegraph !== 'undefined') {
    liquidFlamegraph.flamegraph.resetZoom();
  }
}
