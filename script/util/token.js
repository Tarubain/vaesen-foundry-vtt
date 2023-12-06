import { conditions } from "../util/conditions.js";

export class VaesenTokenHUD extends TokenHUD {
  constructor(...args) {
    super(...args);
  }

  _getStatusEffectChoices(params) {
    var actor = this.object.document.actor;

    let ret = super._getStatusEffectChoices();

    if (actor.type === "player") {  
      return ret;
    }

    for (const [key] of Object.entries(ret)) {
      if (key.startsWith("system"))
      delete ret[key];
    }

    if (actor.type === "npc") {
      return ret;
    }

    if (actor.type === "vaesen") {
      let vaesenActions = {};
      for (let item of Object.values(actor.items.contents)) {
        if (item.type !== "condition") {
          continue;
        }
        vaesenActions[item.img] = {
          cssClass: item.system.active ? "active" : "",
          id: item.id,
          src: item.img,
          title: `${item.name} (${item.system.bonus})`,
          isActive: item.system.active
        };
      }
      vaesenActions["modules/yze-combat/assets/icons/fast-action.svg"] = ret["modules/yze-combat/assets/icons/fast-action.svg"];
      vaesenActions["modules/yze-combat/assets/icons/slow-action.svg"] = ret["modules/yze-combat/assets/icons/slow-action.svg"];
      return vaesenActions;
    }
  }

  async _onToggleEffect(effect, {active, overlay=false}={}) {
    var actor = this.object.document.actor;
    let img = effect.currentTarget;
    if (actor.type !== "vaesen" || img.dataset.statusId == "fastAction" || img.dataset.statusId == "slowAction") {
      return super._onToggleEffect(effect, {active, overlay});
    }
    
    effect.preventDefault();
    effect.stopPropagation();
    const result = await conditions.onVaesenCondition(actor, img.dataset.statusId);

    if ( this.hasActiveHUD ) canvas.tokens.hud.refreshStatusIcons();
    return result;
  }
}