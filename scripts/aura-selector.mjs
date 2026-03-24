const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

export class AuraSelectorApp extends HandlebarsApplicationMixin(ApplicationV2) {
	constructor(actor, sourceItem, auraEffects, options = {}) {
		super(options);
		this.actor = actor;
		this.sourceItem = sourceItem;
		this.auraEffects = auraEffects;
	}

	static DEFAULT_OPTIONS = {
		id: "aura-selector-app",
		classes: ["aura-selector", "dnd5e2"],
		window: {
			title: "Select Elemental Shielding",
			resizable: false,
			contentClasses: ["standard-form"],
		},
		position: {
			width: 420,
		},
		actions: {
			selectAura: AuraSelectorApp.#onSelectAura,
		},
	};

	static PARTS = {
		body: {
			template: "modules/UA2025-RealmsSubclasses/templates/aura-selector.hbs",
			root: true,
		},
	};

	async _prepareContext(options) {
		const context = await super._prepareContext(options);
		context.effects = this.auraEffects.map((effect) => ({
			id: effect.id,
			name: effect.name,
			img: effect.img,
		}));
		return context;
	}

	static async #onSelectAura(event, target) {
		const effectId = target.dataset.effectId;
		const selectedEffect = this.auraEffects.find((e) => e.id === effectId);
		if (!selectedEffect) return;

		const updates = this.auraEffects.flatMap((effect) => {
			const disabled = effect.id !== effectId;
			return effect.disabled === disabled ? [] : [{ _id: effect.id, disabled }];
		});
		if (updates.length) {
			await this.sourceItem.updateEmbeddedDocuments("ActiveEffect", updates);
		}

		// send notification to other users
		const msg = `${this.actor.name} activated: "${selectedEffect.name}"`;

		// notify DM / player of aura change
		const targetUserIds = game.users
			.filter(
				(user) =>
					user.active &&
					(user.isGM || this.actor.testUserPermission(user, "OWNER")),
			)
			.map((user) => user.id);

		const recipients = targetUserIds.filter((id) => id !== game.user.id);
		if (recipients.length) {
			game.socket.emit("module.UA2025-RealmsSubclasses", {
				action: "notifyUsers",
				recipients,
				message: msg,
			});
		}
		if (targetUserIds.includes(game.user.id)) {
			ui.notifications.info(msg);
		}

		await this.close();
	}
}
