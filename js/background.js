// onBeforePageReload
chrome.webNavigation.onBeforeNavigate.addListener(function (details) {
  if (details.frameId == 0) {
    // console.log(`webNavigation.onBeforeNavigate Triggered - ${details.url}`);
    chrome.runtime.sendMessage({
      type: "webNavigation-onBeforeNavigate",
      tabId: details.tabId,
      newUrl: details.url
    });
  }
});

// onDOMContentLoaded
chrome.webNavigation.onDOMContentLoaded.addListener(function (details) {
  if (details.frameId == 0) {
    // console.log("webNavigation.onDOMContentLoaded Triggered");
    chrome.runtime.sendMessage({
      type: "webNavigation-onDOMContentLoaded",
      message: details,
      frameId: details.frameId,
      tabId: details.tabId
    });
  }
});

// onCompleted (onLoadEvent)
chrome.webNavigation.onCompleted.addListener(function (details) {
  if (details.frameId == 0) {
    updateIconImage();
    // console.log("webNavigation.onCompleted Triggered");
    chrome.runtime.sendMessage({
      type: "page-onload-event",
      message: details,
      tabId: details.tabId,
      newUrl: details.url,
      frameId: details.frameId
    });
  }
});

// tabs.onUpdated
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status == "loading") {
    // console.log("tabs.onUpdated Triggered");
    chrome.runtime.sendMessage({
      type: "tab-onUpdated",
      message: {},
      tabId: tabId,
      newUrl: tab.url
    });
  }
});

var initStorage = function () {
  console.log("Initializing Storage");
  chrome.storage.local.get("options", function (result) {
    if (result["options"] === undefined) {
      let options = {
        disablePaintAndPopupOption: false,
        disableURLFilterOption: false
      };
      chrome.storage.local.set({ options: options });
    }
  });
};

// Fire when ext installed
chrome.runtime.onInstalled.addListener(function (event) {
  initStorage();
  if (event.reason === "install") {
    chrome.storage.local.set(
      { freshInstalled: true, extUpdated: false },
      function () {
        console.log("Extension Installed");
      }
    );
  }
  if (event.reason === "update") {
    chrome.storage.local.set(
      { extUpdated: true, freshInstalled: false },
      function () {
        console.log("Extension Updated");
      }
    );
  }
});

// Fires when Chrome starts or when user clicks refresh button in extension page
chrome.runtime.onStartup.addListener(function () {
  initStorage();
  updateIconImage();
});

// Fires when user clicks disable / enable button in extension page
window.onload = function () {
  initStorage();
  updateIconImage();
};

// Popup options changed
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type.match("disableURLFilterOption-message")) {
    updateIconImage();
  }
});

/**
 * Update DrFlare extension icon depending on its status.
 * Gray icon = DrFlare is disabled.
 * Orange icon = DrFlare is enabled.
 */
async function updateIconImage() {
  const options = await getPopupOptionsFromStorage();
  updateIcon(options);
}

/**
 * Get popup options from the local stroge.
 */
function getPopupOptionsFromStorage() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("options", function (result) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        resolve(result["options"])
      }
    });
  });
}

/**
 * Update icon image accordingly.
 * 
 * @param {*} options - popup options
 */
function updateIcon(options) {
  const disableURLFilterOption = options["disableURLFilterOption"];
  if (disableURLFilterOption !== undefined) {
    const path = setIconPath(disableURLFilterOption);

    chrome.browserAction.setIcon({
      path: path
    });
  }
}

/**
 * Return corresponding icon image paths.
 * 
 * @param {boolean} disableURLFilterOption 
 */
function setIconPath(disableURLFilterOption) {
  if (disableURLFilterOption) {
    return {
      "16": '../img/circle-new-logo-black-n-white-16.png',
      "19": '../img/circle-new-logo-black-n-white-19.png',
      "38": '../img/circle-new-logo-black-n-white-38.png'
    };
  } else {
    return {
      "16": '../img/circle-new-logo-16.png',
      "19": '../img/circle-new-logo-19.png',
      "38": '../img/circle-new-logo-38.png'
    };
  }
}