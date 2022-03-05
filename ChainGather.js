const conf = new JsonConfigFile("plugins\\ChainGather\\config.json");
const command = conf.init("command", "chaingather");
const defaultState = conf.init("defaultState", false);
const blockList = conf.init("blockList", {
    undefined: {},
    empty: {},
    "minecraft:wooden_pickaxe": {
        "minecraft:coal_ore": 32,
        "minecraft:quartz_ore": 32,
        "minecraft:nether_gold_ore": 32,
        "minecraft:deepslate_coal_ore": 32,
    },
    "minecraft:stone_pickaxe": {
        "minecraft:iron_ore": 32,
        "minecraft:lapis_ore": 32,
        "minecraft:coal_ore": 32,
        "minecraft:quartz_ore": 32,
        "minecraft:nether_gold_ore": 32,
        "minecraft:deepslate_iron_ore": 32,
        "minecraft:deepslate_lapis_ore": 32,
        "minecraft:deepslate_coal_ore": 32,
    },
    "minecraft:iron_pickaxe": {
        "minecraft:iron_ore": 32,
        "minecraft:gold_ore": 32,
        "minecraft:diamond_ore": 32,
        "minecraft:lapis_ore": 32,
        "minecraft:redstone_ore": 32,
        "minecraft:lit_redstone_ore": 32,
        "minecraft:coal_ore": 32,
        "minecraft:copper_ore": 32,
        "minecraft:emerald_ore": 32,
        "minecraft:quartz_ore": 32,
        "minecraft:nether_gold_ore": 32,
        "minecraft:deepslate_iron_ore": 32,
        "minecraft:deepslate_gold_ore": 32,
        "minecraft:deepslate_diamond_ore": 32,
        "minecraft:deepslate_lapis_ore": 32,
        "minecraft:deepslate_redstone_ore": 32,
        "minecraft:lit_deepslate_redstone_ore": 32,
        "minecraft:deepslate_emerald_ore": 32,
        "minecraft:deepslate_coal_ore": 32,
        "minecraft:deepslate_copper_ore": 32,
    },
    "minecraft:diamond_pickaxe": {
        "minecraft:iron_ore": 32,
        "minecraft:gold_ore": 32,
        "minecraft:diamond_ore": 32,
        "minecraft:lapis_ore": 32,
        "minecraft:redstone_ore": 32,
        "minecraft:lit_redstone_ore": 32,
        "minecraft:coal_ore": 32,
        "minecraft:copper_ore": 32,
        "minecraft:emerald_ore": 32,
        "minecraft:quartz_ore": 32,
        "minecraft:nether_gold_ore": 32,
        "minecraft:ancient_debris": 32,
        "minecraft:deepslate_iron_ore": 32,
        "minecraft:deepslate_gold_ore": 32,
        "minecraft:deepslate_diamond_ore": 32,
        "minecraft:deepslate_lapis_ore": 32,
        "minecraft:deepslate_redstone_ore": 32,
        "minecraft:lit_deepslate_redstone_ore": 32,
        "minecraft:deepslate_emerald_ore": 32,
        "minecraft:deepslate_coal_ore": 32,
        "minecraft:deepslate_copper_ore": 32,
    },
    "minecraft:netherite_pickaxe": {
        "minecraft:iron_ore": 32,
        "minecraft:gold_ore": 32,
        "minecraft:diamond_ore": 32,
        "minecraft:lapis_ore": 32,
        "minecraft:redstone_ore": 32,
        "minecraft:lit_redstone_ore": 32,
        "minecraft:coal_ore": 32,
        "minecraft:copper_ore": 32,
        "minecraft:emerald_ore": 32,
        "minecraft:quartz_ore": 32,
        "minecraft:nether_gold_ore": 32,
        "minecraft:ancient_debris": 32,
        "minecraft:deepslate_iron_ore": 32,
        "minecraft:deepslate_gold_ore": 32,
        "minecraft:deepslate_diamond_ore": 32,
        "minecraft:deepslate_lapis_ore": 32,
        "minecraft:deepslate_redstone_ore": 32,
        "minecraft:lit_deepslate_redstone_ore": 32,
        "minecraft:deepslate_emerald_ore": 32,
        "minecraft:deepslate_coal_ore": 32,
        "minecraft:deepslate_copper_ore": 32,
    },
    "minecraft:golden_pickaxe": {
        "minecraft:coal_ore": 32,
        "minecraft:quartz_ore": 32,
        "minecraft:nether_gold_ore": 32,
        "minecraft:deepslate_coal_ore": 32,
    },
    "minecraft:wooden_axe": {
        "minecraft:log": 32,
    },
    "minecraft:stone_axe": {
        "minecraft:log": 32,
    },
    "minecraft:iron_axe": {
        "minecraft:log": 32,
    },
    "minecraft:diamond_axe": {
        "minecraft:log": 32,
    },
    "minecraft:netherite_axe": {
        "minecraft:log": 32,
    },
    "minecraft:golden_axe": {
        "minecraft:log": 32,
    },
});
conf.close();
const durability = {
    wooden: 59,
    stone: 131,
    iron: 250,
    diamond: 1561,
    netherite: 2031,
};
let db = {};
mc.listen("onServerStarted", () => {
    let cmd = mc.newCommand(command, "设置连锁采集状态。", PermType.Any);
    cmd.overload();
    cmd.setCallback((_, ori) => {
        ori.player.tell(
            `连锁采集已${
                (db[pl.xuid] = db[pl.xuid] ? false : true) ? "启用" : "禁用"
            }`
        );
    });
    cmd.setup();
});
mc.listen("onJoin", (pl) => {
    db[pl.xuid] = defaultState;
});
mc.listen("onDestroyBlock", (player, block) => {
    let item = player.getHand();
    let maxChain = (
        item.isNull()
            ? blockList.empty
            : !blockList[item.type]
            ? blockList.undefined
            : blockList[item.type]
    )[block.type];
    if (!db[player.xuid] || player.gameMode == 1 || maxChain < 1) {
        return;
    }
    let tag = item.getNbt().getTag("tag");
    if (!tag) {
        return;
    }
    let ench = tag.getData("ench");
    if (!ench) {
        return;
    }
    let haveSilk = 0;
    let unbreaking = 100;
    ench.toArray().forEach((e) => {
        haveSilk = e.id == 16 ? e.id : haveSilk;
        unbreaking = e.id == 17 ? 100 / (e.lvl + 1) : unbreaking;
    });
    if (!haveSilk) {
        return;
    }
    let lessDurability = 100;
    Object.keys(durability).forEach((k) => {
        if (new RegExp(k).test(item.type)) {
            lessDurability = durability[k];
        }
    });
    destroy(player, block, item, unbreaking, lessDurability, maxChain);
});
function destroy(player, block, item, unbreaking, lessDurability, maxChain) {
    for (
        let i = 0, j = 1;
        i < 3;
        i = j == -1 ? i + 1 : i, j = j == 1 ? -1 : 1
    ) {
        if (chainCount >= maxChain) {
            return;
        }
        let nextBlock = mc.getBlock(
            i == 0 ? block.pos.x + j : block.pos.x,
            i == 1 ? block.pos.y + j : block.pos.y,
            i == 2 ? block.pos.z + j : block.pos.z,
            block.pos.dimid
        );
        if (item.isNull()) {
            return;
        }
        if (
            nextBlock.type == block.type &&
            mc.runcmdEx(
                `execute "${player.name}" ${nextBlock.pos.x} ${nextBlock.pos.y} ${nextBlock.pos.z} setblock ~~~ air 0 destroy`
            ).success
        ) {
            if (Math.floor(Math.random() * 99) < unbreaking) {
                let nbt = item.getNbt();
                let tag = nbt.getTag("tag");
                if (tag) {
                    let newDurability = tag.getData("Damage") + 1;
                    tag.setInt("Damage", newDurability);
                    if (newDurability < lessDurability) {
                        item.setNbt(nbt);
                    } else {
                        item.setNull();
                    }
                    player.refreshItems();
                }
            }
        }
        destroy(player, nextBlock, item, unbreaking, lessDurability, maxChain);
    }
}
