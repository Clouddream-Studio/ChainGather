let conf = new JsonConfigFile("plugins\\ChainGather\\config.json");
let blockList = conf.init("blockList", {
    undefined: [],
    "minecraft:wooden_pickaxe": [
        "minecraft:coal_ore",
        "minecraft:quartz_ore",
        "minecraft:nether_gold_ore",
        "minecraft:deepslate_coal_ore",
    ],
    "minecraft:stone_pickaxe": [
        "minecraft:iron_ore",
        "minecraft:lapis_ore",
        "minecraft:coal_ore",
        "minecraft:quartz_ore",
        "minecraft:nether_gold_ore",
        "minecraft:deepslate_iron_ore",
        "minecraft:deepslate_lapis_ore",
        "minecraft:deepslate_coal_ore",
    ],
    "minecraft:iron_pickaxe": [
        "minecraft:iron_ore",
        "minecraft:gold_ore",
        "minecraft:diamond_ore",
        "minecraft:lapis_ore",
        "minecraft:redstone_ore",
        "minecraft:lit_redstone_ore",
        "minecraft:coal_ore",
        "minecraft:copper_ore",
        "minecraft:emerald_ore",
        "minecraft:quartz_ore",
        "minecraft:nether_gold_ore",
        "minecraft:deepslate_iron_ore",
        "minecraft:deepslate_gold_ore",
        "minecraft:deepslate_diamond_ore",
        "minecraft:deepslate_lapis_ore",
        "minecraft:deepslate_redstone_ore",
        "minecraft:lit_deepslate_redstone_ore",
        "minecraft:deepslate_emerald_ore",
        "minecraft:deepslate_coal_ore",
        "minecraft:deepslate_copper_ore",
    ],
    "micecraft:diamond_pickaxe": [
        "minecraft:iron_ore",
        "minecraft:gold_ore",
        "minecraft:diamond_ore",
        "minecraft:lapis_ore",
        "minecraft:redstone_ore",
        "minecraft:lit_redstone_ore",
        "minecraft:coal_ore",
        "minecraft:copper_ore",
        "minecraft:emerald_ore",
        "minecraft:quartz_ore",
        "minecraft:nether_gold_ore",
        "minecraft:ancient_debris",
        "minecraft:deepslate_iron_ore",
        "minecraft:deepslate_gold_ore",
        "minecraft:deepslate_diamond_ore",
        "minecraft:deepslate_lapis_ore",
        "minecraft:deepslate_redstone_ore",
        "minecraft:lit_deepslate_redstone_ore",
        "minecraft:deepslate_emerald_ore",
        "minecraft:deepslate_coal_ore",
        "minecraft:deepslate_copper_ore",
    ],
    "minecraft:netherite_pickaxe": [
        "minecraft:iron_ore",
        "minecraft:gold_ore",
        "minecraft:diamond_ore",
        "minecraft:lapis_ore",
        "minecraft:redstone_ore",
        "minecraft:lit_redstone_ore",
        "minecraft:coal_ore",
        "minecraft:copper_ore",
        "minecraft:emerald_ore",
        "minecraft:quartz_ore",
        "minecraft:nether_gold_ore",
        "minecraft:ancient_debris",
        "minecraft:deepslate_iron_ore",
        "minecraft:deepslate_gold_ore",
        "minecraft:deepslate_diamond_ore",
        "minecraft:deepslate_lapis_ore",
        "minecraft:deepslate_redstone_ore",
        "minecraft:lit_deepslate_redstone_ore",
        "minecraft:deepslate_emerald_ore",
        "minecraft:deepslate_coal_ore",
        "minecraft:deepslate_copper_ore",
    ],
    "minecraft:golden_pickaxe": [
        "minecraft:coal_ore",
        "minecraft:quartz_ore",
        "minecraft:nether_gold_ore",
        "minecraft:deepslate_coal_ore",
    ],
});
const command = conf.init("command", "cc");
const boardName = conf.init("boardName", "");
const maxChain = conf.init("maxChain", 25);
const durability = conf.init("durability", {
    wooden: 59,
    stone: 131,
    iron: 250,
    diamond: 1561,
    netherite: 2031,
});
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
    if (
        data[pl.xuid] &&
        pl.gameMode != 1 &&
        (blockList[it.type] == undefined
            ? blockList.undefined
            : blockList[it.type]
        ).indexOf(bl.type) > -1
    ) {
        let have = false;
        let nb = 100;
        let md = 0;
        let tag = it.getNbt().getTag("tag");
        if (tag != undefined) {
            let ench = tag.getData("ench");
            if (ench != undefined) {
                ench.toArray().forEach((e) => {
                    have = e.id == 16 ? true : have;
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
            destroy(pl, bl, it, nb, md, co);
        }
    }
});
function destroy(pl, bl, it, ub, md, co) {
    for (let i = 0, j = 1; i < 3; i = j == -1 ? i + 1 : i, j = j == 1 ? -1 : 1) {
        if (co < maxChain) {
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
                destroy(pl, nbl, it, ub, md, co);
            }
        }
    }
}
log("Made by Clouddream Studio with ♥");
