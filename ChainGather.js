const conf = new JsonConfigFile("plugins\\ChainGather\\config.json");
const command = conf.init("command", "cc");
const boardName = conf.init("boardName", "");
const blockList = conf.init("blockList", {
    undefined: {},
    empty: {},
    "minecraft:wooden_pickaxe": {
        "minecraft:coal_ore": 25,
        "minecraft:quartz_ore": 25,
        "minecraft:nether_gold_ore": 25,
        "minecraft:deepslate_coal_ore": 25,
    },
    "minecraft:stone_pickaxe": {
        "minecraft:iron_ore": 25,
        "minecraft:lapis_ore": 25,
        "minecraft:coal_ore": 25,
        "minecraft:quartz_ore": 25,
        "minecraft:nether_gold_ore": 25,
        "minecraft:deepslate_iron_ore": 25,
        "minecraft:deepslate_lapis_ore": 25,
        "minecraft:deepslate_coal_ore": 25,
    },
    "minecraft:iron_pickaxe": {
        "minecraft:iron_ore": 25,
        "minecraft:gold_ore": 25,
        "minecraft:diamond_ore": 25,
        "minecraft:lapis_ore": 25,
        "minecraft:redstone_ore": 25,
        "minecraft:lit_redstone_ore": 25,
        "minecraft:coal_ore": 25,
        "minecraft:copper_ore": 25,
        "minecraft:emerald_ore": 25,
        "minecraft:quartz_ore": 25,
        "minecraft:nether_gold_ore": 25,
        "minecraft:deepslate_iron_ore": 25,
        "minecraft:deepslate_gold_ore": 25,
        "minecraft:deepslate_diamond_ore": 25,
        "minecraft:deepslate_lapis_ore": 25,
        "minecraft:deepslate_redstone_ore": 25,
        "minecraft:lit_deepslate_redstone_ore": 25,
        "minecraft:deepslate_emerald_ore": 25,
        "minecraft:deepslate_coal_ore": 25,
        "minecraft:deepslate_copper_ore": 25,
    },
    "minecraft:diamond_pickaxe": {
        "minecraft:iron_ore": 25,
        "minecraft:gold_ore": 25,
        "minecraft:diamond_ore": 25,
        "minecraft:lapis_ore": 25,
        "minecraft:redstone_ore": 25,
        "minecraft:lit_redstone_ore": 25,
        "minecraft:coal_ore": 25,
        "minecraft:copper_ore": 25,
        "minecraft:emerald_ore": 25,
        "minecraft:quartz_ore": 25,
        "minecraft:nether_gold_ore": 25,
        "minecraft:ancient_debris": 25,
        "minecraft:deepslate_iron_ore": 25,
        "minecraft:deepslate_gold_ore": 25,
        "minecraft:deepslate_diamond_ore": 25,
        "minecraft:deepslate_lapis_ore": 25,
        "minecraft:deepslate_redstone_ore": 25,
        "minecraft:lit_deepslate_redstone_ore": 25,
        "minecraft:deepslate_emerald_ore": 25,
        "minecraft:deepslate_coal_ore": 25,
        "minecraft:deepslate_copper_ore": 25,
    },
    "minecraft:netherite_pickaxe": {
        "minecraft:iron_ore": 25,
        "minecraft:gold_ore": 25,
        "minecraft:diamond_ore": 25,
        "minecraft:lapis_ore": 25,
        "minecraft:redstone_ore": 25,
        "minecraft:lit_redstone_ore": 25,
        "minecraft:coal_ore": 25,
        "minecraft:copper_ore": 25,
        "minecraft:emerald_ore": 25,
        "minecraft:quartz_ore": 25,
        "minecraft:nether_gold_ore": 25,
        "minecraft:ancient_debris": 25,
        "minecraft:deepslate_iron_ore": 25,
        "minecraft:deepslate_gold_ore": 25,
        "minecraft:deepslate_diamond_ore": 25,
        "minecraft:deepslate_lapis_ore": 25,
        "minecraft:deepslate_redstone_ore": 25,
        "minecraft:lit_deepslate_redstone_ore": 25,
        "minecraft:deepslate_emerald_ore": 25,
        "minecraft:deepslate_coal_ore": 25,
        "minecraft:deepslate_copper_ore": 25,
    },
    "minecraft:golden_pickaxe": {
        "minecraft:coal_ore": 25,
        "minecraft:quartz_ore": 25,
        "minecraft:nether_gold_ore": 25,
        "minecraft:deepslate_coal_ore": 25,
    },
    "minecraft:wooden_axe": {
        "minecraft:log": 25,
    },
    "minecraft:stone_axe": {
        "minecraft:log": 25,
    },
    "minecraft:iron_axe": {
        "minecraft:log": 25,
    },
    "minecraft:diamond_axe": {
        "minecraft:log": 25,
    },
    "minecraft:netherite_axe": {
        "minecraft:log": 25,
    },
    "minecraft:golden_axe": {
        "minecraft:log": 25,
    },
});
const durability = {
    wooden: 59,
    stone: 131,
    iron: 250,
    diamond: 1561,
    netherite: 2031,
};
conf.close();
let data = {};
mc.regPlayerCmd(command, "设置连锁采集状态。", (pl) => {
    data[pl.xuid] = data[pl.xuid] ? false : true;
    pl.tell(`连锁采集已${data[pl.xuid] ? "启用" : "禁用"}`);
});
mc.listen("onJoin", (pl) => {
    data[pl.xuid] = false;
});
mc.listen("onDestroyBlock", (pl, bl) => {
    let it = pl.getHand();
    let mx = (
        it.isNull()
            ? blockList.empty
            : blockList[it.type] == undefined
                ? blockList.undefined
                : blockList[it.type]
    )[bl.type];
    if (data[pl.xuid] && pl.gameMode != 1 && mx) {
        let have = 0;
        let nb = 100;
        let md = 0;
        let tag = it.getNbt().getTag("tag");
        if (tag != undefined) {
            let ench = tag.getData("ench");
            if (ench != undefined) {
                ench.toArray().forEach((e) => {
                    have = e.id == 16 ? e.id : have;
                    nb = e.id == 17 ? 100 / (e.lvl + 1) : nb;
                });
            }
        }
        Object.keys(durability).forEach((k) => {
            if (new RegExp(k).test(it.type)) {
                md = durability[k];
            }
        });
        if (!have) {
            let co = 0;
            destroy(pl, bl, it, nb, md, co, mx);
        }
    }
});
function destroy(pl, bl, it, ub, md, co, mx) {
    for (let i = 0, j = 1; i < 3; i = j == -1 ? i + 1 : i, j = j == 1 ? -1 : 1) {
        if (co < mx) {
            let nbl = mc.getBlock(
                i == 0 ? bl.pos.x + j : bl.pos.x,
                i == 1 ? bl.pos.y + j : bl.pos.y,
                i == 2 ? bl.pos.z + j : bl.pos.z,
                bl.pos.dimid
            );
            if (
                nbl.type == bl.type &&
                mc.runcmdEx(
                    `execute "${pl.name}" ${nbl.pos.x} ${nbl.pos.y} ${nbl.pos.z} setblock ~~~ air 0 destroy`
                ).success
            ) {
                if (Math.floor(Math.random() * 99) < ub) {
                    let nbt = it.getNbt();
                    let tag = nbt.getTag("tag");
                    if (tag != undefined) {
                        let nd = tag.getData("Damage") + 1;
                        tag.setInt("Damage", nd);
                        if (nd < md) {
                            it.setNbt(nbt);
                        } else {
                            it.setNull();
                        }
                        pl.refreshItems();
                    } else if (pl.getHand().type != it.type) {
                        break;
                    }
                }
                co++;
                destroy(pl, nbl, it, ub, md, co, mx);
            }
        }
    }
}
log("Made by Clouddream Studio with ♥");
