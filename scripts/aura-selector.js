const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

class AuraSelectorApp extends (HandlebarsApplicationMixin(ApplicationV2)) {
  constructor(actor, auraEffects, options={}) {
    super(options);
    this.actor = actor;
    this.auraEffects = auraEffects;
  }

  static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
    id: "aura-selector-app",
    classes: ["aura-selector"],
    window: {
      title: "Select Aura of Elemental Shielding",
      resizable: false
    },
    position: {
      width: 400
    },
    actions: {
      selectAura: AuraSelectorApp.#onSelectAura
    }
  });

  static PARTS = {
    body: {
      template: "modules/UA2025-RealmsSubclasses/templates/aura-selector.hbs",
      root: true
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.effects = this.auraEffects.map(effect => ({
      id: effect.id,
      name: effect.name,
      img: effect.img
    }));
    return context;
  }

  static async #onSelectAura(event, button) {
    const effectId = button.dataset.effectId;
    const selectedEffect = this.auraEffects.find(e => e.id === effectId);
    if (!selectedEffect) return;

    for (const other of this.auraEffects) {
      if (!other.disabled) await other.update({ disabled: true });
    }
    await selectedEffect.update({ disabled: false });

    // send notification to other users
    const msg = `${this.actor.name} activated: "${selectedEffect.name}"`;

    // notify DM / player of aura change
    const targetUserIds = game.users
      .filter(user =>
        user.active &&
        (user.isGM || this.actor.testUserPermission(user, "OWNER"))
      )
      .map(user => user.id);

    // Immediate local feedback
    ui.notifications.info(msg);

    // Emit to others via SocketLib
    const mod = game.modules.get("UA2025-RealmsSubclasses");
    const sock = mod?.api?.socket;
    if (sock) await sock.executeForUsers("notifyUsers", targetUserIds, { userIds: targetUserIds, message: msg });
    
    await this.close();
  }
}

// Expose to global so macros can call it
globalThis.AuraSelectorApp = AuraSelectorApp;
