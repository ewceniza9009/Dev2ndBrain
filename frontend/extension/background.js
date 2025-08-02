// The base URL of your running frontend application
const APP_URL = "http://localhost:5174";

// Create a context menu item when the extension is installed.
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "dev2ndbrain-clip",
    title: "Save to Dev2ndBrain",
    contexts: ["selection"] // This menu item will only appear when text is selected
  });
});

// Listen for clicks on our context menu item.
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "dev2ndbrain-clip" && info.selectionText) {
    // Construct the URL for our app's clip page
    const clipUrl = new URL(`${APP_URL}/clip`);

    // Add the clipped data as URL search parameters
    clipUrl.searchParams.append("title", tab.title || "Clipped Note");
    clipUrl.searchParams.append("content", info.selectionText);
    clipUrl.searchParams.append("source", tab.url || "");

    // Open a new tab with the constructed URL
    chrome.tabs.create({ url: clipUrl.href });
  }
});