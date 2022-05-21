export const hideChatActionButtons = (message, html, data) => {
    const card = html.find(".vaesen.chat-card");


    if (card.length > 0) {
        let user = game.actors.get(card.attr("data-owner-id"));

        if ((user && !user.isOwner)) {
            const buttons = card.find(".push");
            buttons.each((_i, btn) => {
                btn.style.display = "none";
            });
        }
    }
}

export const buildChatCard = (type, data) => {
    const actor = game.actors.get(ChatMessage.getSpeaker().actor);


    let token = "systems/vaesen/asset/info.png"; // default the token to info mark
    if (actor) { token = actor.data.img; } // change token to actor token if that applies


    // build the html message for the chat card
    const message = buildMessageByType(type, data, token);

    const chatData = {
        speaker: ChatMessage.getSpeaker(),
        user: game.user.id,
        rollMode: game.settings.get("core", "rollMode"),
        content: message
    };
    return chatData;
}

function buildMessageByType(type, data, token) {


    let messages = {
        'armor': () => `<div class="card-holder" style="position: relative;">
            <img src="${token}" width="45" height="45" class="roll-token" />
            <div class='chat-flavor'>${data.name.toUpperCase()}</div><div class='flex row center'><img src='${data.img}' width=50 height=50/></div><div class='chat-item-info flex column'><div><b>${game.i18n.localize("ARMOR.PROTECTION")}: </b>${data.data.protection}</div><div><b>${game.i18n.localize("ARMOR.AGILITY")}: </b>${data.data.agility}</div><div><b>${game.i18n.localize("ARMOR.AVAILABILITY")}: </b>${data.data.availability}</div></div></div>`,
        'attack': () => {
            let desc = '';
            let attr = data.data.attribute;
            let label = '';
            if (attr == 'bodyControl') {
                label = "ATTRIBUTE.BODY_CONTROL_ROLL";
            } else {
                label = "ATTRIBUTE." + attr.toUpperCase() + "_ROLL";
            }
            let testName = game.i18n.localize(label);
            if (data.data.description != '') {
                desc = "<b>" + game.i18n.localize("ATTACK.DESCRIPTION") + ": </b>" + data.data.description + "</br>";
            }
            return `<div class="card-holder" style="position: relative;">
            <img src="${token}" width="45" height="45" class="roll-token" />
            <div class='chat-flavor'>${data.name.toUpperCase()}</div><div class='flex row center'><img src='${data.img}' width=50 height=50/></div><div class='chat-item-info flex column'><b>${game.i18n.localize("ATTACK.ATTRIBUTE")}: </b>${testName}</br><b>${game.i18n.localize("ATTACK.DAMAGE")}: </b>${data.data.damage}</br><b>${game.i18n.localize("ATTACK.RANGE")}: </b>${data.data.range}</br>${desc}</div></div>`;
        },
        'condition': () => `<div class="card-holder" style="position: relative;">
            <img src="${token}" width="45" height="45" class="roll-token" />
            <div class='chat-flavor'>${data.name.toUpperCase()}</div><div class='flex row center'><img src='${data.img}' width=50 height=50/></div><div class='chat-item-info flex column'><b>${game.i18n.localize("CONDITION.BONUS")}: </b>${data.data.bonus}</br><b>${game.i18n.localize("CONDITION.DESCRIPTION")}: </b>${data.data.description}</br></div></div>`,
        'criticalInjury': () => {
            let timeLimit = '';
            if (data.data.timeLimit != '') {
                timeLimit = "<b>" + game.i18n.localize("CRITICAL_INJURY.TIME_LIMIT") + ": </b>" + data.data.timeLimit + "</br>";
            }

            let type = data.data.type.charAt(0).toUpperCase() + data.data.type.slice(1);

            return `<div class="card-holder" style="position: relative;">
            <img src="${token}" width="45" height="45" class="roll-token" />
            <div class='chat-flavor'>${data.name.toUpperCase()}</div><div class='flex row center'><img src='${data.img}' width=50 height=50/></div><div class='chat-item-info flex column'><b>${game.i18n.localize("CRITICAL_INJURY.TYPE")}: </b>${type}</br><b>${game.i18n.localize("CRITICAL_INJURY.FATAL")}: </b>${data.data.fatal}</br>${timeLimit}<b>${game.i18n.localize("CRITICAL_INJURY.EFFECT")}: </b>${data.data.effect}</br></div></div>`;

        },
        'gear': () => {
            let description = '';
            let risk = '';

            if (data.data.description != '') {
                description = "<b>" + game.i18n.localize("GEAR.DESCRIPTION") + ": </b>" + data.data.description + "</br>";
            }
            if (data.data.risk != '') {
                risk = "<b>" + game.i18n.localize("GEAR.RISK") + ": </b>" + data.data.risk + "</br>";
            }

            return `<div class="card-holder" style="position: relative;">
            <img src="${token}" width="45" height="45" class="roll-token" />
            <div class='chat-flavor'>${data.name.toUpperCase()}</div><div class='flex row center'><img src='${data.img}' width=50 height=50/></div><div class='chat-item-info flex column'><b>${game.i18n.localize("GEAR.BONUS")}: </b>${data.data.bonus}</br><b>${game.i18n.localize("GEAR.AVAILABILITY")}: </b>${data.data.availability}</br><b>${game.i18n.localize("GEAR.EFFECT")}: </b>${data.data.effect}</br>${description}${risk}</div></div>`;

        },
        'magic': () => `<div class="card-holder" style="position: relative;">
            <img src="${token}" width="45" height="45" class="roll-token" />
            <div class='chat-flavor'>${data.name.toUpperCase()}</div><div class='flex row center'><img src='${data.img}' width=50 height=50/></div><div class='chat-item-info flex column'><b>${game.i18n.localize("MAGIC.CATEGORY")}: </b>${data.data.category}</br><b>${game.i18n.localize("MAGIC.DESCRIPTION")}: </b>${data.data.description}</br></div></div>`,
        'talent': () => `<div class="card-holder" style="position: relative;">
            <img src="${token}" width="45" height="45" class="roll-token" />
            <div class='chat-flavor'>${data.name.toUpperCase()}</div><div class='flex row center'><img src='${data.img}' width=50 height=50/></div><div class='chat-item-info flex column'><b>${game.i18n.localize("TALENT.DESCRIPTION")}: </b>${data.data.description}</br></div></div>`,
        'upgrade': () => {
            let prereq = '';
            let asset = '';
            if (data.data.prerequisite != '') {
                prereq = "<b>" + game.i18n.localize("UPGRADE.PREREQUISITE") + ": </b>" + data.data.prerequisite + "</br>";
            }
            if (data.data.asset != '') {
                asset = "<b>" + game.i18n.localize("UPGRADE.ASSET") + ": </b>" + data.data.asset + "</br>";
            }

            return `<div class="card-holder" style="position: relative;">
            <img src="${token}" width="45" height="45" class="roll-token" />
            <div class='chat-flavor'>${data.name.toUpperCase()}</div><div class='flex row center'><img src='${data.img}' width=50 height=50/></div><div class='chat-item-info flex column'><b>${game.i18n.localize("UPGRADE.COST")}: </b>${data.data.cost}</br>${prereq}<b>${game.i18n.localize("UPGRADE.FUNCTION")}: </b>${data.data.function}</br>${asset}<b>${game.i18n.localize("TALENT.DESCRIPTION")}: </b>${data.data.description}</br></div></div>`;
        },
        'weapon': () => {
            let skill = '';
            if (data.data.skill == "closeCombat") {
                skill = game.i18n.localize("SKILL.CLOSE_COMBAT");
            } else if (data.data.skill == "rangedCombat") {
                skill = game.i18n.localize("SKILL.RANGED_COMBAT");
            } else {
                skill = game.i18n.localize("SKILL.FORCE");
            }
            return `<div class="card-holder" style="position: relative;">
            <img src="${token}" width="45" height="45" class="roll-token" />
            <div class='chat-flavor'>${data.name.toUpperCase()}</div><div class='flex row center'><img src='${data.img}' width=50 height=50/></div><div class='chat-item-info flex column'><b>${game.i18n.localize("WEAPON.DAMAGE")}: </b>${data.data.damage}</br><b>${game.i18n.localize("WEAPON.RANGE")}: </b>${data.data.range}</br><b>${game.i18n.localize("WEAPON.BONUS")}: </b>${data.data.bonus}</br><b>${game.i18n.localize("WEAPON.AVAILABILITY")}: </b>${data.data.availability}</br><b>${game.i18n.localize("WEAPON.SKILL")}: </b>${skill}</br></div></div>`;
        },
        'relationship': () => `<div class="card-holder" style="position: relative;">
            <img src="${token}" width="45" height="45" class="roll-token" />
            <div class='chat-flavor'>${data.name.toUpperCase()}</div><div class='flex row center'><img src='${data.img}' width=50 height=50/></div><div class='chat-item-info flex column'><b>${game.i18n.localize("BIO.RELATIONSHIP")}: </b>${data.data.description}</br><b>${game.i18n.localize("NOTES")}: </b>${data.data.notes}</br></div></div>`

    }

    return messages[type]();
}