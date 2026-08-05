HUB.tabs.achievements = { title: "Achievements | InFlux Origin" };
if (new URLSearchParams(window.location.search).get("tab") === "achievements") {
  activateTab("achievements", { fromHistory: true, instant: true, keepScroll: true });
}
