let socket;
export const MODULE_ID = "UA2025-RealmsSubclasses";


Hooks.once("init", () => {
  CONFIG.DND5E.featureTypes.class.subtypes.dreadAllegiance = "Dread Allegiance";
  // Preload Handlebars template
  loadTemplates([`modules/${MODULE_ID}/templates/aura-selector.hbs`]);

  console.log(`${MODULE_ID}.js hooked`);
});


Hooks.once("socketlib.ready", () => {
  // Register your world/module with SocketLib
  socket = socketlib.registerModule(MODULE_ID);

  // Register a function that other clients can call
  socket.register("notifyUsers", ({ userIds, message }) => {
    if (userIds.includes(game.user.id)) {
      ui.notifications.info(message);
    }
  });

  console.log(`[${MODULE_ID}.js] SocketLib registered.`);
  // Expose a stable API reference other scripts can use without re-registering
  const mod = game.modules.get(MODULE_ID);
  if (mod) {
    mod.api ??= {};
    mod.api.socket = socket;
  }
});