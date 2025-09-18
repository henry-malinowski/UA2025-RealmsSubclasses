async function updatePurpleDragonCompanion() {
    const sourceToken = canvas.tokens.controlled[0];
    const targetToken = Array.from(game.user.targets)[0];
    
    // Check if source token has purple-dragon-companion in identifiedItems
    const sourceActor = sourceToken?.actor;
    const hasCompanion = sourceActor?.identifiedItems?.has("purple-dragon-companion");
    
    if (!hasCompanion) {
        ui.notifications.error("Selected token must have the Purple Dragon Companion feature.");
        return;
    }
    
    const targetActor = targetToken?.actor;
    
    try {
        // Calculate bonus from source actor's proficiency
        const profBonus = sourceActor.system.attributes.prof;
        const intMod = sourceActor.system.abilities.int.mod.toString();
        const bonus = Math.floor(profBonus / 2).toString();
        
        // Update global bonuses on target actor
        await targetActor.update({
            "system.bonuses.mwak.attack": intMod,
            "system.bonuses.mwak.damage": intMod,
            "system.bonuses.abilities.check": bonus,
            "system.bonuses.abilities.save": bonus
        });
        
        ui.notifications.info(`Updated save and check bonuses to +${bonus}.`);
        ui.notifications.info(`Updated attack bonus to +${eval("3+" + intMod)}.`);
        
    } catch (error) {
        console.error("Error updating bonuses:", error);
    }
}

// Expose to global so macros can call it
globalThis.updatePurpleDragonCompanion = updatePurpleDragonCompanion;