const conf = new JsonConfigFile("plugins\\ChainGather\\config.json");
const command = conf.init("command", "chaingather");
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
let data = {};
mc.regPlayerCmd(command, "设置连锁采集状态。", (pl) => {
    pl.tell(
        `连锁采集已${(data[pl.xuid] = data[pl.xuid] ? false : true) ? "启用" : "禁用"
        }`
    );
});
mc.listen("onJoin", (pl) => {
    data[pl.xuid] = false;
});
mc.listen("onDestroyBlock", (pl, bl) => {
    let it = pl.getHand();
    let mx = (
        it.isNull()
            ? blockList.empty
            : !blockList[it.type]
                ? blockList.undefined
                : blockList[it.type]
    )[bl.type];
    if (data[pl.xuid] && pl.gameMode != 1 && mx) {
        let have = 0;
        let nb = 100;
        let md = 0;
        let tag = it.getNbt().getTag("tag");
        if (tag) {
            let ench = tag.getData("ench");
            if (ench) {
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
function destroy(pl, bl, it, nb, md, co, mx) {
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
                if (Math.floor(Math.random() * 99) < nb) {
                    let nbt = it.getNbt();
                    let tag = nbt.getTag("tag");
                    if (tag) {
                        let nd = tag.getData("Damage") + 1;
                        tag.setInt("Damage", nd);
                        if (nd < md) {
                            it.setNbt(nbt);
                        } else {
                            it.setNull();
                        }
                        pl.refreshItems();
                    }
                }
                co++;
                destroy(pl, nbl, it, nb, md, co, mx);
            }
        }
    }
}
