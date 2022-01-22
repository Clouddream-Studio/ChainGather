let conf = new JsonConfigFile("plugins\\ChainGather\\config.json");
let oreList = conf.init("oreList", [
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
]);
const command = conf.init("command", "cc");
const boardName = conf.init("boardName", "");
const maxChain = conf.init("maxChain", 25);
let cost = conf.init("cost", 10);
conf.close();
let data = {};
cost = cost < 0 ? 0 : cost;
mc.listen("onDestroyBlock", (pl, bl) => {
    if (data[pl.xuid] && pl.gameMode == 0 && oreList.indexOf(bl.type) > -1) {
        let tag = pl.getHand().getNbt().getTag("tag");
        let have = false;
        if (tag != undefined) {
            let ench = tag.getData("ench");
            if (ench != undefined) {
                ench.toArray().forEach((e) => {
                    have = e.id == 16 ? true : have;
                });
            }
        }
        if (!have) {
            let count = destroy(pl, bl);
            if (count > 0) {
                pl.tell(
                    `本次挖掘了${count}个方块${cost > 0 ? `，消费${count * cost}元` : ""}`
                );
            }
        }
    }
});
mc.listen("onJoin", (pl) => {
    data[pl.xuid] = false;
});
mc.regPlayerCmd(command, "设置连锁采集状态", (pl) => {
    data[pl.xuid] = data[pl.xuid] ? false : true;
    pl.tell(`连锁采集已${data[pl.xuid] ? "启用" : "禁用"}`);
});
function destroy(pl, bl) {
    let count = 0;
    for (let i = 0, j = 1; i < 3; i = j == -1 ? i + 1 : i, j = j == 1 ? -1 : 1) {
        let nbl = mc.getBlock(
            i == 0 ? bl.pos.x + j : bl.pos.x,
            i == 1 ? bl.pos.y + j : bl.pos.y,
            i == 2 ? bl.pos.z + j : bl.pos.z,
            bl.pos.dimid
        );
        if (
            nbl.type == bl.type && boardName == ""
                ? money.reduce(pl.xuid, cost)
                : pl.getScore(boardName) < cost
                    ? false
                    : pl.reduceScore(boardName, cost) &&
                    mc.runcmdEx(
                        `execute "${pl.name}" ${nbl.pos.x} ${nbl.pos.y} ${nbl.pos.z} setblock ~~~ air 0 destroy`
                    ).success
        ) {
            count += destroy(pl, nbl) + 1;
        }
    }
    return count;
}
log("Made by Clouddream Studio with ♥");
