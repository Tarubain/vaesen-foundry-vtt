import { prepareRollDialog } from "../util/roll.js";
import { YearZeroRoll } from "../lib/yzur.js";
import { buildChatCard } from "../util/chat.js";
import { VaesenActorSheet } from "../actor/vaesen-actor-sheet.js";

export class VaesenCharacterSheet extends VaesenActorSheet {
  //TODO convert dices[] to a YZUR roll object to pass rolls and allow pushes
  dices = new YearZeroRoll();
  lastTestName = "";
  lastDamage = 0;

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["vaesen", "sheet", "actor"],
      width: 950,
      height: 800,
      resizable: true,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "main",
        },
      ],
    });
  }


  activateListeners(html) {
    super.activateListeners(html);
    html.find(".item-create").click((ev) => {
      this.onItemCreate(ev);
    });
    html.find(".item-edit").click((ev) => {
      this.onItemUpdate(ev);
    });
    html.find(".item-delete").click((ev) => {
      this.onItemDelete(ev);
    });
    html.find(".to-chat").click((ev) => {
      this.sendToChat(ev);
    });
    html.find("input").focusin((ev) => this.onFocusIn(ev));

    html.find(".attribute b").click((ev) => {
      const div = $(ev.currentTarget).parents(".attribute");
      const attributeName = div.data("key");
      const attribute = this.actor.system.attribute[attributeName];
      const testName = game.i18n.localize(attribute.label);
      let bonus = this.computeBonusFromConditions();
      prepareRollDialog(this, testName, attribute.value, 0, bonus, 0);
    });

    html.find(".armor .icon").click((ev) => {
      this.onArmorRoll(ev);
    });
    html.find(".armor .name").click((ev) => {
      this.onItemSummary(ev, "armor");
    });
    html.find(".armor .protection").click((ev) => {
      this.onArmorRoll(ev);
    });
    html.find(".armor .agility").click((ev) => {
      this.onArmorRoll(ev);
    });

    html.find(".attack .icon").click((ev) => {
      this.onWeaponRoll(ev);
    });
    html.find(".attack .name").click((ev) => {
      this.onItemSummary(ev, "attack");
    });
    html.find(".attack .damage").click((ev) => {
      this.onWeaponRoll(ev);
    });
    html.find(".attack .range").click((ev) => {
      this.onWeaponRoll(ev);
    });
    html.find(".attack .description").click((ev) => {
      this.onWeaponRoll(ev);
    });

    html.find(".magic .icon").click((ev) => {
      this.onItemUpdate(ev);
    });
    html.find(".magic .name").click((ev) => {
      this.onItemSummary(ev, "magic");
    });
    html.find(".magic .fatal").click((ev) => {
      this.onItemUpdate(ev);
    });
    html.find(".magic .time-limit").click((ev) => {
      this.onItemUpdate(ev);
    });
    html.find(".magic .effect").click((ev) => {
      this.onItemUpdate(ev);
    });

    html.find(".gear .icon").click((ev) => {
      this.onItemUpdate(ev);
    });
    html.find(".gear .name").click((ev) => {
      this.onItemSummary(ev, "gear");
    });
    html.find(".gear .bonus").click((ev) => {
      this.onItemUpdate(ev);
    });
    html.find(".gear .effect").click((ev) => {
      this.onItemUpdate(ev);
    });

    html.find(".condition .selected").change((ev) => {
      this.onToggleActive(ev);
    });
    html.find(".condition .name").click((ev) => {
      this.onItemSummary(ev, "condition");
    });
    html.find(".condition .bonus").click((ev) => {
      this.onItemSummary(ev, "condition");
    });
  }

  

  async onToggleActive(event) {
    let element = event.currentTarget;
    let itemID = element.closest(".item").dataset.itemId;
    let item = this.actor.items.get(itemID);
    if (item.system.active) {
      await this.actor.updateEmbeddedDocuments("Item", [
        { _id: itemID, "data.active": false },
      ]);
    } else {
      await this.actor.updateEmbeddedDocuments("Item", [
        { _id: itemID, "data.active": true },
      ]);
    }
  }

  sendToChat(event) {
    const div = $(event.currentTarget).parents(".item");
    const item = this.actor.items.get(div.data("itemId"));
    const data = item.data;
    let type = data.type;
    let chatData = buildChatCard(type, data);
    ChatMessage.create(chatData, {});
  }

  /****** Toggle the roll-down of expanded item information.  */
  onItemSummary(event, type) {
    let div = $(event.currentTarget).parents(".item"),
      item = this.actor.items.get(div.data("itemId")),
      chatData = "";

    switch (type) {
      case "condition":
        let itemDesc = item.system.description;
        chatData =
          "<p class='item-desc'><b>" +
          game.i18n.localize("CONDITION.DESCRIPTION") +
          ":</b> " +
          itemDesc +
          "</br></p>";
        break;
      case "attack":
        chatData =
          "<p class='item-desc'><b>" +
          game.i18n.localize("WEAPON.DAMAGE") +
          ":</b> " +
          item.system.damage +
          " | <b>" +
          game.i18n.localize("WEAPON.RANGE") +
          ":</b> " +
          item.system.range +
          "</br></p>";
        break;
      case "gear":
        chatData =
          "<p class='item-desc'><b>" +
          game.i18n.localize("GEAR.BONUS") +
          ":</b> " +
          item.system.bonus +
          "</br><b>" +
          game.i18n.localize("GEAR.EFFECT") +
          ":</b> " +
          item.system.effect +
          "</br><b>" +
          game.i18n.localize("GEAR.DESCRIPTION") +
          ":</b> " +
          item.system.description +
          "</br></p>";
        break;
      case "magic":
        chatData =
          "<p class='item-desc'><b>" +
          game.i18n.localize("MAGIC.CATEGORY") +
          ":</b> " +
          item.system.category +
          " </br><b>" +
          game.i18n.localize("MAGIC.DESCRIPTION") +
          ":</b> " +
          item.system.description +
          "</br></p>";
        break;
      case "armor":
        chatData =
          "<p class='item-desc'><b>" +
          game.i18n.localize("ARMOR.PROTECTION") +
          ":</b> " +
          item.system.protection +
          " | <b>" +
          game.i18n.localize("ARMOR.AGILITY") +
          ":</b> " +
          item.system.agility +
          "</br></p>";
        break;
    }

    if (chatData === null) {
      return;
    } else if (div.hasClass("expanded")) {
      let sum = div.children(".item-summary");
      sum.slideUp(200, () => sum.remove());
    } else {
      let sum = $(`<div class="item-summary">${chatData}</div>`);
      div.append(sum.hide());
      sum.slideDown(200);
    }
    div.toggleClass("expanded");
  }

  onItemCreate(event) {
    event.preventDefault();
    let header = event.currentTarget;
    let data = duplicate(header.dataset);
    data["name"] = `New ${data.type.capitalize()}`;
    this.actor.createEmbeddedDocuments("Item", [data]);
  }

  onItemUpdate(event) {
    const div = $(event.currentTarget).parents(".item");
    const item = this.actor.items.get(div.data("itemId"));
    item.sheet.render(true);
  }

  onItemDelete(event) {
    const div = $(event.currentTarget).parents(".item");
    this.actor.deleteEmbeddedDocuments("Item", [div.data("itemId")]);
    div.slideUp(200, () => this.render(false));
  }

  onFocusIn(event) {
    $(event.currentTarget).select();
  }

  onArmorRoll(event) {
    const div = $(event.currentTarget).parents(".armor");
    const item = this.actor.items.get(div.data("itemId"));
    const testName = item.name;
    prepareRollDialog(this, testName, 0, 0, item.system.protection, 0);
  }

  onWeaponRoll(event) {
    const div = $(event.currentTarget).parents(".attack");
    const item = this.actor.items.get(div.data("itemId"));
    const testName = item.name;
    let bonus = this.computeBonusFromConditions();
    let attribute =
      this.actor.system.attribute[item.system.attribute].value;
    prepareRollDialog(
      this,
      testName,
      attribute,
      0,
      bonus,
      item.system.damage
    );
  }

  /****** determing current dice pool modifier from the last active condition */
  computeBonusFromConditions() {
    let items = Array.from(this.actor.items);
    let lastBonus = 0;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type === "condition" && items[i].system.active) {
        lastBonus = items[i].system.bonus;
      }
    }
    return lastBonus;
  }
}
